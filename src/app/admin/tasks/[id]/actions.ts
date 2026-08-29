"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function addComment(taskId: string, userId: string, content: string) {
  await prisma.taskComment.create({
    data: {
      taskId,
      userId,
      content
    }
  });
  revalidatePath(`/admin/tasks/${taskId}`);
}

export async function addDependency(taskId: string, blockedByTaskId: string) {
  // Prevent circular dependency simple check or just try
  if (taskId === blockedByTaskId) return;
  await prisma.taskDependency.create({
    data: {
      blockedTaskId: taskId,
      blockingTaskId: blockedByTaskId
    }
  });
  revalidatePath(`/admin/tasks/${taskId}`);
}

export async function removeDependency(dependencyId: string, taskId: string) {
  await prisma.taskDependency.delete({ where: { id: dependencyId } });
  revalidatePath(`/admin/tasks/${taskId}`);
}
