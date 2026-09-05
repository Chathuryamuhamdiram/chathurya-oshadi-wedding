"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getAdminSession, requirePermission } from "@/lib/auth";
import { PERMISSIONS, hasPermission } from "@/lib/permissions";
import { checkDeletePermission, createDeleteAuditLog } from "@/lib/admin/delete-helpers";
import { getActiveEventId, ALL_EVENTS_VALUE } from "@/lib/event-context";

export async function saveTask(formData: FormData) {
  try {
    const session = await getAdminSession();
    if (!session) throw new Error("Unauthorized");
    
    const id = formData.get("id") as string | null;
    const assignedUserId = formData.get("assignedUserId") as string;
    
    // Authorization
    if (id) {
      // Editing
      const task = await prisma.task.findUnique({ where: { id } });
      if (!task) throw new Error("Task not found");
      
      const isAssignedToMe = task.assignedUserId === session.userId;
      if (!isAssignedToMe) {
        await requirePermission(PERMISSIONS.TASK_EDIT);
      }
    } else {
      // Creating
      await requirePermission(PERMISSIONS.TASK_CREATE);
    }
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const priority = formData.get("priority") as string;
    const startDateStr = formData.get("startDate") as string;
    const dueDateStr = formData.get("dueDate") as string;
    const reminderSetting = formData.get("reminderSettings") as string;

    if (!title) return { success: false, error: "Title is required" };

    let reminderSettingsJson = null;
    const reminderType = formData.get("reminderType") as string;
    
    if (reminderType === "CUSTOM") {
      const customDate = formData.get("customReminderDate") as string;
      if (customDate) {
        reminderSettingsJson = JSON.stringify({ customDate, remindAt: ["CUSTOM"] });
      }
    } else if (reminderType && reminderType !== "none") {
      reminderSettingsJson = JSON.stringify({ remindAt: [reminderType] });
    }

    let eventId = formData.get("eventId") as string | null;

    if (!id && !eventId) {
      eventId = await getActiveEventId();
      if (eventId === ALL_EVENTS_VALUE) {
        const wedding = await prisma.ceremonyEvent.findFirst({ where: { eventType: "WEDDING", isActive: true } });
        if (wedding) eventId = wedding.id;
      }
    }

    const data: any = {
      title,
      description,
      category,
      priority: priority || "MEDIUM",
      startDate: startDateStr ? new Date(startDateStr) : null,
      dueDate: dueDateStr ? new Date(dueDateStr) : null,
      assignedUserId: assignedUserId && assignedUserId !== "none" ? assignedUserId : null,
      reminderSettings: reminderSettingsJson,
      status: formData.get("status") as string || "NOT_STARTED", // use provided status or default
    };

    if (eventId) {
      data.eventId = eventId;
    }

    if (id) {
      // Update task
      await prisma.task.update({ where: { id }, data });
    } else {
      await prisma.task.create({ data });
    }

    revalidatePath("/admin/tasks");
    revalidatePath("/admin/search");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateTaskStatus(id: string, completed: boolean) {
  try {
    const session = await getAdminSession();
    if (!session) throw new Error("Unauthorized");

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) throw new Error("Task not found");

    const isAssignedToMe = task.assignedUserId === session.userId;
    if (!isAssignedToMe) {
      await requirePermission(PERMISSIONS.TASK_COMPLETE);
    }

    await prisma.task.update({
      where: { id },
      data: { status: completed ? "COMPLETED" : "NOT_STARTED" }
    });
    revalidatePath("/admin/tasks");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteTask(id: string) {
  try {
    const { session, error } = await checkDeletePermission(PERMISSIONS.TASK_DELETE);
    if (error) return { success: false, error };

    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task) return { success: false, error: "Task not found" };

    await prisma.task.delete({ where: { id } });

    await createDeleteAuditLog(
      session!.userId,
      "Task",
      id,
      { title: task.title },
      "DELETE"
    );

    revalidatePath("/admin/tasks");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete task" };
  }
}
