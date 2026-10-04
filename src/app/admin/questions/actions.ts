"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";
import { checkDeletePermission, createDeleteAuditLog } from "@/lib/admin/delete-helpers";

const questionSchema = z.object({
  id: z.string().optional(),
  eventId: z.string().optional().nullable(),
  vendorId: z.string().optional().nullable(),
  askFromName: z.string().optional().nullable(),
  question: z.string().min(1, "Question is required"),
  category: z.string().default("Other"),
  status: z.string().default("TO_ASK"),
  answer: z.string().optional().nullable(),
  internalNote: z.string().optional().nullable(),
  followUpRequired: z.boolean().default(false),
  followUpDate: z.string().optional().nullable(),
});

export async function saveQuestionAction(formData: FormData) {
  try {
    const session = await requirePermission(PERMISSIONS.CALENDAR_MANAGE);
    
    const eventId = formData.get("eventId") as string || null;
    const vendorId = formData.get("vendorId") as string || null;
    let askFromName = formData.get("askFromName") as string || null;

    if (vendorId) {
      askFromName = null; // if vendorId is selected, clear askFromName
    }

    const rawData = {
      id: formData.get("id") as string || undefined,
      eventId: eventId === "ALL" ? null : eventId,
      vendorId: vendorId,
      askFromName: askFromName,
      question: formData.get("question") as string,
      category: formData.get("category") as string || "Other",
      status: formData.get("status") as string || "TO_ASK",
      answer: formData.get("answer") as string || null,
      internalNote: formData.get("internalNote") as string || null,
      followUpRequired: formData.get("followUpRequired") === "true",
      followUpDate: formData.get("followUpDate") as string || null,
    };

    const parsed = questionSchema.parse(rawData);
    const dateObj = parsed.followUpDate ? new Date(parsed.followUpDate) : null;

    if (parsed.id) {
      const existing = await prisma.questionClarification.findUnique({ where: { id: parsed.id } });
      if (!existing) throw new Error("Question not found");

      await prisma.questionClarification.update({
        where: { id: parsed.id },
        data: {
          eventId: parsed.eventId,
          vendorId: parsed.vendorId,
          askFromName: parsed.askFromName,
          question: parsed.question,
          category: parsed.category,
          status: parsed.status,
          answer: parsed.answer,
          internalNote: parsed.internalNote,
          followUpRequired: parsed.followUpRequired,
          followUpDate: dateObj,
        }
      });

      // Audit Answer changes
      if (existing.answer !== parsed.answer) {
        await prisma.auditLog.create({
          data: {
            userId: session.userId,
            action: "ANSWER_QUESTION",
            entity: "QuestionClarification",
            entityId: parsed.id,
            oldValue: existing.answer || "",
            newValue: parsed.answer || "",
          }
        });
      }

      // Audit Status changes
      if (existing.status !== parsed.status) {
        await prisma.auditLog.create({
          data: {
            userId: session.userId,
            action: "CHANGE_QUESTION_STATUS",
            entity: "QuestionClarification",
            entityId: parsed.id,
            oldValue: existing.status,
            newValue: parsed.status,
          }
        });
      }

    } else {
      const created = await prisma.questionClarification.create({
        data: {
          eventId: parsed.eventId,
          vendorId: parsed.vendorId,
          askFromName: parsed.askFromName,
          question: parsed.question,
          category: parsed.category,
          status: parsed.status,
          answer: parsed.answer,
          internalNote: parsed.internalNote,
          followUpRequired: parsed.followUpRequired,
          followUpDate: dateObj,
          createdById: session.userId,
        }
      });

      await prisma.auditLog.create({
        data: {
          userId: session.userId,
          action: "CREATE_QUESTION",
          entity: "QuestionClarification",
          entityId: created.id,
          newValue: created.question,
        }
      });
    }

    revalidatePath("/admin/questions");
    return { success: true };
  } catch (error: any) {
    console.error("Save question error:", error);
    return {
      success: false,
      error: error && typeof error === "object" && "errors" in error
        ? (error as any).errors.map((e: any) => e.message).join(", ")
        : error.message || "Failed to save question"
    };
  }
}

export async function bulkPasteQuestionsAction(questionsData: { question: string, category: string, eventId: string | null, vendorId: string | null, askFromName: string | null }[]) {
  try {
    const session = await requirePermission(PERMISSIONS.CALENDAR_MANAGE);
    
    let createdCount = 0;
    
    for (const q of questionsData) {
      if (!q.question || q.question.trim() === "") continue;
      
      const created = await prisma.questionClarification.create({
        data: {
          eventId: q.eventId === "ALL" ? null : q.eventId,
          vendorId: q.vendorId,
          askFromName: q.vendorId ? null : q.askFromName,
          question: q.question.trim(),
          category: q.category || "Other",
          status: "TO_ASK",
          createdById: session.userId,
        }
      });
      createdCount++;
    }

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: "BULK_IMPORT_QUESTIONS",
        entity: "QuestionClarification",
        newValue: `${createdCount} questions imported`,
      }
    });

    revalidatePath("/admin/questions");
    return { success: true, count: createdCount };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to bulk import questions" };
  }
}

export async function deleteQuestionAction(id: string) {
  try {
    const { session, error } = await checkDeletePermission(PERMISSIONS.CALENDAR_DELETE);
    if (error) return { success: false, error };

    const q = await prisma.questionClarification.findUnique({ where: { id } });
    if (!q) return { success: false, error: "Question not found" };

    await prisma.questionClarification.delete({ where: { id } });

    await createDeleteAuditLog(session!.userId, "QuestionClarification", id, { question: q.question }, "DELETE");

    revalidatePath("/admin/questions");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Failed to delete question" };
  }
}

export async function quickUpdateQuestionAction(id: string, data: { status?: string, answer?: string, followUpRequired?: boolean }) {
  try {
    const session = await requirePermission(PERMISSIONS.CALENDAR_MANAGE);
    
    const existing = await prisma.questionClarification.findUnique({ where: { id } });
    if (!existing) throw new Error("Question not found");

    const updateData: any = {};
    if (data.status !== undefined) updateData.status = data.status;
    if (data.answer !== undefined) updateData.answer = data.answer;
    if (data.followUpRequired !== undefined) updateData.followUpRequired = data.followUpRequired;

    await prisma.questionClarification.update({
      where: { id },
      data: updateData
    });

    // Audits
    if (data.answer !== undefined && existing.answer !== data.answer) {
      await prisma.auditLog.create({
        data: {
          userId: session.userId,
          action: "ANSWER_QUESTION",
          entity: "QuestionClarification",
          entityId: id,
          oldValue: existing.answer || "",
          newValue: data.answer || "",
        }
      });
    }

    if (data.status !== undefined && existing.status !== data.status) {
      await prisma.auditLog.create({
        data: {
          userId: session.userId,
          action: "CHANGE_QUESTION_STATUS",
          entity: "QuestionClarification",
          entityId: id,
          oldValue: existing.status,
          newValue: data.status,
        }
      });
    }

    revalidatePath("/admin/questions");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update question" };
  }
}
