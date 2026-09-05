"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";
import { checkDeletePermission, createDeleteAuditLog } from "@/lib/admin/delete-helpers";
import { ExpenseType } from "@prisma/client";
import { getActiveEventId, ALL_EVENTS_VALUE } from "@/lib/event-context";

export async function saveBudgetCategory(formData: FormData) {
  try {
    await requirePermission(PERMISSIONS.BUDGET_EDIT);
    const name = formData.get("name") as string;
    
    if (!name) return { success: false, error: "Category name is required" };

    await prisma.budgetCategory.create({
      data: { name }
    });

    revalidatePath("/admin/budget");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteBudgetCategory(id: string) {
  try {
    const { session, error } = await checkDeletePermission(null);
    if (error) return { success: false, error };

    const category = await prisma.budgetCategory.findUnique({
      where: { id },
      include: { items: true }
    });
    if (!category) return { success: false, error: "Category not found" };

    if (category.items.length > 0) {
      return { success: false, error: `This category cannot be deleted because it contains ${category.items.length} budget items. Move or delete those budget items before deleting this category.` };
    }

    await prisma.budgetCategory.delete({ where: { id } });
    await createDeleteAuditLog(session!.userId, "BudgetCategory", id, { name: category.name }, "DELETE");
    
    revalidatePath("/admin/budget");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function saveBudgetItem(formData: FormData) {
  try {
    await requirePermission(PERMISSIONS.BUDGET_EDIT);
    const id = formData.get("id") as string | null;
    const title = formData.get("title") as string;
    const categoryId = formData.get("categoryId") as string;
    const vendorId = formData.get("vendorId") as string | null;
    const estimatedCost = parseFloat(formData.get("estimatedCost") as string || "0");
    const paymentDueDateStr = formData.get("paymentDueDate") as string;
    const advancePaidStr = formData.get("advancePaid") as string;
    const advancePaid = advancePaidStr ? parseFloat(advancePaidStr) : 0;
    const advancePaymentDateStr = formData.get("advancePaymentDate") as string;
    
    let eventId = formData.get("eventId") as string | null;

    if (!id && !eventId) {
      eventId = await getActiveEventId();
      if (eventId === ALL_EVENTS_VALUE) {
        const wedding = await prisma.ceremonyEvent.findFirst({ where: { eventType: "WEDDING", isActive: true } });
        if (wedding) eventId = wedding.id;
      }
    }

    if (!title || !categoryId) return { success: false, error: "Title and Category are required" };
    if (!id && !eventId) return { success: false, error: "Event ID is required for creating a budget item" };

    const data: any = {
      title,
      categoryId,
      vendorId: vendorId === "none" ? null : (vendorId || null),
      estimatedCost,
      paymentDueDate: paymentDueDateStr ? new Date(paymentDueDateStr) : null,
    };

    if (!id && eventId) {
      data.eventId = eventId;
    }

    await prisma.$transaction(async (tx) => {
      let budgetItemId = id;

      if (id) {
        await tx.budgetItem.update({ where: { id }, data });
      } else {
        const newItem = await tx.budgetItem.create({ data });
        budgetItemId = newItem.id;
      }

      // Handle ADVANCE Expense
      if (budgetItemId) {
        const existingAdvance = await tx.expense.findFirst({
          where: { budgetItemId, expenseType: "ADVANCE" }
        });

        if (advancePaid > 0) {
          if (existingAdvance) {
            await tx.expense.update({
              where: { id: existingAdvance.id },
              data: {
                amount: advancePaid,
                expenseDate: advancePaymentDateStr ? new Date(advancePaymentDateStr) : new Date()
              }
            });
          } else {
            await tx.expense.create({
              data: {
                budgetItemId,
                expenseName: "Advance Payment",
                expenseType: "ADVANCE",
                amount: advancePaid,
                expenseDate: advancePaymentDateStr ? new Date(advancePaymentDateStr) : new Date()
              }
            });
          }
        } else if (advancePaid === 0 && existingAdvance) {
          await tx.expense.delete({ where: { id: existingAdvance.id } });
        }

        // Recalculate Budget Item
        const item = await tx.budgetItem.findUnique({ 
          where: { id: budgetItemId },
          include: { expenses: true }
        });
        
        if (item) {
          const totalPaid = item.expenses.reduce((sum, e) => sum + Number(e.amount), 0);
          let status = "NOT_STARTED";
          if (totalPaid >= Number(item.estimatedCost) && Number(item.estimatedCost) > 0) status = "FULLY_PAID";
          else if (totalPaid > 0) status = "PARTIALLY_PAID";
          
          await tx.budgetItem.update({
            where: { id: budgetItemId },
            data: {
              paidAmount: totalPaid,
              paymentStatus: status,
            }
          });
        }
      }
    });

    revalidatePath("/admin/budget");
    revalidatePath("/admin/vendors");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function saveExpense(formData: FormData) {
  try {
    await requirePermission(PERMISSIONS.BUDGET_EDIT);
    const budgetItemId = formData.get("budgetItemId") as string;
    const amount = parseFloat(formData.get("amount") as string);
    const expenseName = formData.get("expenseName") as string;
    const expenseType = (formData.get("expenseType") as ExpenseType) || "OTHER";
    
    if (!budgetItemId || !amount || !expenseName) {
      return { success: false, error: "Required fields missing" };
    }

    // Wrap in transaction to update parent item
    await prisma.$transaction(async (tx) => {
      // Create expense record
      await tx.expense.create({
        data: {
          budgetItemId,
          expenseName,
          amount,
          expenseType
        }
      });

      // Recalculate parent item
      const item = await tx.budgetItem.findUnique({ 
        where: { id: budgetItemId },
        include: { expenses: true }
      });
      
      if (item) {
        const totalPaid = item.expenses.reduce((sum, e) => sum + Number(e.amount), 0);
        let status = "NOT_STARTED";
        if (totalPaid >= Number(item.estimatedCost) && Number(item.estimatedCost) > 0) status = "FULLY_PAID";
        else if (totalPaid > 0) status = "PARTIALLY_PAID";
        
        await tx.budgetItem.update({
          where: { id: budgetItemId },
          data: {
            paidAmount: totalPaid,
            paymentStatus: status,
          }
        });
      }
    });

    revalidatePath("/admin/budget");
    revalidatePath("/admin/vendors");
    revalidatePath("/admin"); // update dashboard
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteExpense(id: string) {
  try {
    const { session, error } = await checkDeletePermission(null); // SUPER_ADMIN only
    if (error) return { success: false, error };

    const expense = await prisma.expense.findUnique({
      where: { id }
    });
    if (!expense) return { success: false, error: "Expense not found" };

    // Wrap in transaction to update parent item
    await prisma.$transaction(async (tx) => {
      await tx.expense.delete({ where: { id } });

      // Recalculate parent item
      const item = await tx.budgetItem.findUnique({ 
        where: { id: expense.budgetItemId },
        include: { expenses: true }
      });
      
      if (item) {
        const totalPaid = item.expenses.reduce((sum, e) => sum + Number(e.amount), 0);
        let status = "NOT_STARTED";
        if (totalPaid >= Number(item.estimatedCost) && Number(item.estimatedCost) > 0) status = "FULLY_PAID";
        else if (totalPaid > 0) status = "PARTIALLY_PAID";
        
        await tx.budgetItem.update({
          where: { id: expense.budgetItemId },
          data: {
            paidAmount: totalPaid,
            paymentStatus: status,
          }
        });
      }
    });

    await createDeleteAuditLog(session!.userId, "Expense", id, { expenseName: expense.expenseName, amount: Number(expense.amount) }, "DELETE");
    revalidatePath("/admin/budget");
    revalidatePath("/admin/vendors");
    revalidatePath("/admin"); 
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteBudgetItem(id: string) {
  try {
    const { session, error } = await checkDeletePermission(null); // SUPER_ADMIN only
    if (error) return { success: false, error };

    const item = await prisma.budgetItem.findUnique({
      where: { id },
      include: { expenses: true }
    });
    if (!item) return { success: false, error: "Budget item not found" };

    if (item.expenses.length > 0) {
      return { success: false, error: "Cannot delete budget item with linked expenses. Delete the expenses first." };
    }

    await prisma.budgetItem.delete({ where: { id } });
    await createDeleteAuditLog(session!.userId, "BudgetItem", id, { title: item.title, estimatedCost: Number(item.estimatedCost) }, "DELETE");
    
    revalidatePath("/admin/budget");
    revalidatePath("/admin/vendors");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function saveContribution(formData: FormData) {
  try {
    await requirePermission(PERMISSIONS.BUDGET_EDIT);
    const id = formData.get("id") as string | null;
    const contributorName = formData.get("contributorName") as string;
    const amount = parseFloat(formData.get("amount") as string || "0");
    const contributionDateStr = formData.get("contributionDate") as string;
    const paymentMethod = formData.get("paymentMethod") as string | null;
    const reference = formData.get("reference") as string | null;
    const notes = formData.get("notes") as string | null;
    const status = formData.get("status") as string || "RECEIVED";

    let eventId = formData.get("eventId") as string | null;

    if (!id && !eventId) {
      eventId = await getActiveEventId();
      if (eventId === ALL_EVENTS_VALUE) {
        const wedding = await prisma.ceremonyEvent.findFirst({ where: { eventType: "WEDDING", isActive: true } });
        if (wedding) eventId = wedding.id;
      }
    }

    if (!contributorName || amount <= 0) {
      return { success: false, error: "Valid contributor name and amount greater than 0 are required" };
    }

    const data: any = {
      contributorName,
      amount,
      contributionDate: contributionDateStr ? new Date(contributionDateStr) : new Date(),
      paymentMethod,
      reference,
      notes,
      status,
    };

    if (eventId) {
      data.eventId = eventId;
    }

    if (id) {
      await prisma.contribution.update({ where: { id }, data });
    } else {
      await prisma.contribution.create({ data });
    }

    revalidatePath("/admin/budget");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteContribution(id: string) {
  try {
    const { session, error } = await checkDeletePermission(null); // SUPER_ADMIN only
    if (error) return { success: false, error };

    const contribution = await prisma.contribution.findUnique({ where: { id } });
    if (!contribution) return { success: false, error: "Contribution not found" };

    await prisma.contribution.delete({ where: { id } });
    await createDeleteAuditLog(session!.userId, "Contribution", id, { contributorName: contribution.contributorName, amount: Number(contribution.amount) }, "DELETE");

    revalidatePath("/admin/budget");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
