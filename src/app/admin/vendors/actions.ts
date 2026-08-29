"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";

export async function saveVendor(formData: FormData) {
  try {
    await requirePermission(PERMISSIONS.VENDOR_EDIT);
    const id = formData.get("id") as string | null;
    const vendorName = formData.get("vendorName") as string;
    const contactName = formData.get("contactName") as string;
    const phone = formData.get("phone") as string;
    const email = formData.get("email") as string;
    const serviceCategory = formData.get("serviceCategory") as string;
    const quotationAmount = parseFloat(formData.get("quotationAmount") as string || "0");
    const finalAmount = parseFloat(formData.get("finalAmount") as string || "0");
    const advancePaid = parseFloat(formData.get("advancePaid") as string || "0");
    const nextPaymentDueStr = formData.get("nextPaymentDue") as string;
    const notes = formData.get("notes") as string;

    if (!vendorName) return { success: false, error: "Vendor name is required" };

    const data = {
      vendorName,
      contactName: contactName || null,
      phone: phone || null,
      email: email || null,
      serviceCategory: serviceCategory || null,
      quotationAmount,
      finalAmount,
      advancePaid,
      nextPaymentDue: nextPaymentDueStr ? new Date(nextPaymentDueStr) : null,
      notes: notes || null,
    };

    if (id) {
      await prisma.vendor.update({ where: { id }, data });
    } else {
      await prisma.vendor.create({ data });
    }

    revalidatePath("/admin/vendors");
    revalidatePath("/admin/search");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteVendor(id: string) {
  try {
    await requirePermission(PERMISSIONS.VENDOR_EDIT);
    await prisma.vendor.delete({ where: { id } });
    revalidatePath("/admin/vendors");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
