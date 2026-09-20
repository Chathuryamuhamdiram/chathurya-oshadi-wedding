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
    const assigneeIds = formData.getAll("assigneeIds") as string[];
    
    // Authorization
    if (id) {
      // Editing
      const task = await prisma.task.findUnique({ where: { id }, include: { assignees: true } });
      if (!task) throw new Error("Task not found");
      
      const isAssignedToMe = task.assignees.some(u => u.id === session.userId);
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
    const targetDateStr = formData.get("targetDate") as string;
    
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
      targetDate: targetDateStr ? new Date(targetDateStr) : null,
      reminderSettings: reminderSettingsJson,
      status: formData.get("status") as string || "NOT_STARTED",
    };

    if (eventId) {
      data.eventId = eventId;
    }

    if (assigneeIds && assigneeIds.length > 0 && assigneeIds[0] !== "") {
       // Filter out empty strings if any
       const validIds = assigneeIds.filter(id => id.trim() !== "");
       data.assignees = {
          [id ? 'set' : 'connect']: validIds.map(userId => ({ id: userId }))
       };
    } else if (id) {
       // Clear assignees if editing and none provided
       data.assignees = { set: [] };
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

    const task = await prisma.task.findUnique({ where: { id }, include: { assignees: true } });
    if (!task) throw new Error("Task not found");

    const isAssignedToMe = task.assignees.some(u => u.id === session.userId);
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

// -- Task Items Actions --

export async function saveTaskItem(taskId: string, name: string) {
  try {
    await requirePermission(PERMISSIONS.TASK_EDIT);
    await prisma.taskItem.create({
      data: { taskId, name }
    });
    revalidatePath(`/admin/tasks/${taskId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function toggleTaskItem(itemId: string, completed: boolean) {
  try {
    const session = await getAdminSession();
    if (!session) throw new Error("Unauthorized");
    
    // allow edit permission or if assigned
    const item = await prisma.taskItem.findUnique({ where: { id: itemId }, include: { task: { include: { assignees: true } } } });
    if (!item) throw new Error("Item not found");
    
    const isAssignedToMe = item.task.assignees.some(u => u.id === session.userId);
    if (!isAssignedToMe) {
       await requirePermission(PERMISSIONS.TASK_COMPLETE);
    }

    await prisma.taskItem.update({
      where: { id: itemId },
      data: { completed }
    });
    revalidatePath(`/admin/tasks/${item.taskId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateTaskItemName(itemId: string, name: string) {
  try {
    await requirePermission(PERMISSIONS.TASK_EDIT);
    const item = await prisma.taskItem.update({
      where: { id: itemId },
      data: { name }
    });
    revalidatePath(`/admin/tasks/${item.taskId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteTaskItem(itemId: string) {
  try {
    await requirePermission(PERMISSIONS.TASK_EDIT);
    const item = await prisma.taskItem.delete({
      where: { id: itemId }
    });
    revalidatePath(`/admin/tasks/${item.taskId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function bulkAddTaskItems(taskId: string, items: string[]) {
  try {
    await requirePermission(PERMISSIONS.TASK_EDIT);
    await prisma.taskItem.createMany({
      data: items.map(name => ({ taskId, name }))
    });
    revalidatePath(`/admin/tasks/${taskId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
