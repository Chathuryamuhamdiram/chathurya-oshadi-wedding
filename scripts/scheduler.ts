import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

console.log("Starting Automated Task Scheduler...");

async function processReminders() {
  console.log(`[${new Date().toISOString()}] Scanning for task reminders...`);
  
  try {
    const tasks = await prisma.task.findMany({
      where: {
        status: { notIn: ['COMPLETED', 'CANCELLED'] },
        reminderSettings: { not: null }
      },
      include: {
        assignedUser: true
      }
    });

    const now = new Date();

    for (const task of tasks) {
      if (!task.assignedUserId || !task.dueDate || !task.reminderSettings) continue;

      try {
        const settings = JSON.parse(task.reminderSettings);
        const remindAt: string[] = settings.remindAt || [];
        
        const due = new Date(task.dueDate);
        const daysUntilDue = Math.floor((due.getTime() - now.getTime()) / (1000 * 3600 * 24));
        
        let shouldRemind = false;
        let reminderType = "";
        let message = "";
        let escalateToAdmins = false;

        // Strict Timeline Logic
        if (daysUntilDue === 7) {
          shouldRemind = true;
          reminderType = "7_DAYS_BEFORE";
          message = `Upcoming Task: "${task.title}" is due in 7 days.`;
        } else if (daysUntilDue === 3) {
          shouldRemind = true;
          reminderType = "3_DAYS_BEFORE";
          message = `Reminder: "${task.title}" is due in 3 days.`;
        } else if (daysUntilDue === 1) {
          shouldRemind = true;
          reminderType = "1_DAY_BEFORE";
          message = `Urgent: "${task.title}" is due tomorrow!`;
        } else if (daysUntilDue === 0) {
          shouldRemind = true;
          reminderType = "DUE_TODAY";
          message = `Action Required: "${task.title}" is due TODAY.`;
        } else if (daysUntilDue === -1) {
          shouldRemind = true;
          reminderType = "OVERDUE_1_DAY";
          message = `OVERDUE: "${task.title}" was due yesterday!`;
        } else if (daysUntilDue === -3) {
          shouldRemind = true;
          reminderType = "OVERDUE_3_DAYS";
          message = `ESCALATION: "${task.title}" is 3 days overdue!`;
          escalateToAdmins = true;
        }

        if (shouldRemind) {
          // Check if we already sent this specific reminder type today to avoid spamming
          const existingReminder = await prisma.taskReminder.findFirst({
            where: {
              taskId: task.id,
              reminderType: reminderType,
            }
          });

          if (!existingReminder) {
            console.log(`Generating reminder [${reminderType}] for Task: ${task.title}`);
            
            // Log the reminder
            await prisma.taskReminder.create({
              data: {
                taskId: task.id,
                reminderType: reminderType,
                reminderAt: now,
                status: "SENT",
                sentAt: now,
              }
            });

            // Create the actual Notification for the assignee
            await prisma.notification.create({
              data: {
                userId: task.assignedUserId,
                type: "TASK_REMINDER",
                title: escalateToAdmins ? "Escalated Task" : "Task Reminder",
                message: message,
                linkUrl: `/admin/tasks/${task.id}`,
              }
            });

            // Escalation: Notify Chathurya and Oshadi (or any ADMIN/SUPER_ADMIN)
            if (escalateToAdmins) {
              const admins = await prisma.user.findMany({
                where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } }
              });
              
              for (const admin of admins) {
                // Don't notify the admin again if they are the assignee
                if (admin.id === task.assignedUserId) continue;
                
                await prisma.notification.create({
                  data: {
                    userId: admin.id,
                    type: "SYSTEM",
                    title: "Task Escalation",
                    message: `Assignee ${task.assignedUser?.fullName || 'Someone'} is 3 days late on task: "${task.title}"`,
                    linkUrl: `/admin/tasks/${task.id}`,
                  }
                });
              }
            }
          }
        }

      } catch (err) {
        console.error(`Error parsing reminder settings for task ${task.id}:`, err);
      }
    }
  } catch (error) {
    console.error("Error processing reminders:", error);
  }
}

// Run immediately once
processReminders();

// Then poll every minute (in a real app, this might be every hour)
setInterval(processReminders, 60000);
