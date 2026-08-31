import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
export const dynamic = "force-dynamic";

// Allow this endpoint to be called publicly (e.g. by Vercel Cron or cron-job.org)
export async function GET(request: Request) {
  try {
    const now = new Date();

    // 1. Find all pending reminders that are due
    const pendingReminders = await prisma.taskReminder.findMany({
      where: {
        status: "PENDING",
        reminderAt: {
          lte: now,
        },
      },
      include: {
        task: true,
      },
    });

    if (pendingReminders.length === 0) {
      return NextResponse.json({ success: true, processedCount: 0, message: "No pending reminders to process." });
    }

    let processedCount = 0;

    // 2. Process each reminder
    for (const reminder of pendingReminders) {
      // If task has an assigned user, create a notification
      if (reminder.task.assignedUserId) {
        let title = "Task Reminder";
        let message = `Reminder for task: ${reminder.task.title}`;

        // Format message based on reminder type
        switch (reminder.reminderType) {
          case "7_DAYS_BEFORE":
            title = "Task due in 7 days";
            message = `Upcoming task: "${reminder.task.title}" is due soon.`;
            break;
          case "3_DAYS_BEFORE":
            title = "Task due in 3 days";
            message = `Don't forget: "${reminder.task.title}" is due in 3 days.`;
            break;
          case "1_DAY_BEFORE":
            title = "Task due tomorrow";
            message = `Action required: "${reminder.task.title}" is due tomorrow!`;
            break;
          case "DUE_TODAY":
            title = "Task due TODAY";
            message = `CRITICAL: "${reminder.task.title}" is due today.`;
            break;
          case "OVERDUE":
            title = "Task Overdue!";
            message = `URGENT: "${reminder.task.title}" is now overdue.`;
            break;
        }

        // Create the in-app notification
        await prisma.notification.create({
          data: {
            userId: reminder.task.assignedUserId,
            type: "TASK_REMINDER",
            title,
            message,
            linkUrl: `/admin/tasks`, // Assuming we have a tasks page
          },
        });

        // NOTE: If Email integration was selected, we would call our email service here.
        // e.g. await sendEmailNotification(user.email, title, message)
      }

      // Mark reminder as SENT
      await prisma.taskReminder.update({
        where: { id: reminder.id },
        data: {
          status: "SENT",
          sentAt: new Date(),
        },
      });

      processedCount++;
    }

    return NextResponse.json({
      success: true,
      processedCount,
      message: `Successfully processed ${processedCount} reminders.`
    });

  } catch (error) {
    console.error("Cron Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
