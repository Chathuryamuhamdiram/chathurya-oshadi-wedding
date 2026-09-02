"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";
import { checkDeletePermission, createDeleteAuditLog } from "@/lib/admin/delete-helpers";

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

export async function saveBudgetItem(formData: FormData) {
  try {
    await requirePermission(PERMISSIONS.BUDGET_EDIT);
    const id = formData.get("id") as string | null;
    const title = formData.get("title") as string;
    const categoryId = formData.get("categoryId") as string;
    const estimatedCost = parseFloat(formData.get("estimatedCost") as string || "0");
    const paymentDueDateStr = formData.get("paymentDueDate") as string;
    
    if (!title || !categoryId) return { success: false, error: "Title and Category are required" };

    const data = {
      title,
      categoryId,
      estimatedCost,
      paymentDueDate: paymentDueDateStr ? new Date(paymentDueDateStr) : null,
    };

    if (id) {
      await prisma.budgetItem.update({ where: { id }, data });
    } else {
      await prisma.budgetItem.create({ data });
    }

    revalidatePath("/admin/budget");
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
        }
      });

      // Recalculate parent item
      const item = await tx.budgetItem.findUnique({ 
        where: { id: budgetItemId },
        include: { expenses: true }
      });
      
      if (item) {
        const totalPaid = item.expenses.reduce((sum, e) => sum + e.amount, amount);
        let status = "NOT_STARTED";
        if (totalPaid >= item.estimatedCost && item.estimatedCost > 0) status = "FULLY_PAID";
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
        const totalPaid = item.expenses.reduce((sum, e) => sum + e.amount, 0);
        let status = "NOT_STARTED";
        if (totalPaid >= item.estimatedCost && item.estimatedCost > 0) status = "FULLY_PAID";
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

    await createDeleteAuditLog(session!.userId, "Expense", id, { expenseName: expense.expenseName, amount: expense.amount }, "DELETE");
    revalidatePath("/admin/budget");
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
    await createDeleteAuditLog(session!.userId, "BudgetItem", id, { title: item.title, estimatedCost: item.estimatedCost }, "DELETE");
    
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
    await createDeleteAuditLog(session!.userId, "Contribution", id, { contributorName: contribution.contributorName, amount: contribution.amount }, "DELETE");

    // Revalidate paths when UI exists
    // revalidatePath("/admin/contributions");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
