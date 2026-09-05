"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";
import { checkDeletePermission, createDeleteAuditLog } from "@/lib/admin/delete-helpers";
import { VendorStatus } from "@prisma/client";

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
    const nextPaymentDueStr = formData.get("nextPaymentDue") as string;
    const notes = formData.get("notes") as string;
    const status = (formData.get("status") as VendorStatus) || "POTENTIAL";

    if (!vendorName) return { success: false, error: "Vendor name is required" };

    const data: any = {
      vendorName,
      contactName: contactName || null,
      phone: phone || null,
      email: email || null,
      serviceCategory: serviceCategory || null,
      quotationAmount,
      finalAmount,
      nextPaymentDue: nextPaymentDueStr ? new Date(nextPaymentDueStr) : null,
      notes: notes || null,
      status,
    };

    if (id) {
      await prisma.vendor.update({ where: { id }, data });
    } else {
      await prisma.vendor.create({ data });
    }

    revalidatePath("/admin/vendors");
    revalidatePath("/admin/search");
    revalidatePath("/admin/budget");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteVendor(id: string) {
  try {
    const { session, error } = await checkDeletePermission(PERMISSIONS.VENDOR_DELETE);
    if (error) return { success: false, error };

    const vendor = await prisma.vendor.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!vendor) return { success: false, error: "Vendor not found" };

    if (vendor.items.length > 0) {
      return { success: false, error: "This vendor cannot be deleted because it is linked to budget items. Unlink or remove the related budget items first, or archive the vendor instead." };
    }

    await prisma.vendor.delete({ where: { id } });
    await createDeleteAuditLog(session!.userId, "Vendor", id, { vendorName: vendor.vendorName }, "DELETE");
    revalidatePath("/admin/vendors");
    revalidatePath("/admin/budget");
    return { success: true, action: "DELETED" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function archiveVendor(id: string) {
  try {
    const { session, error } = await checkDeletePermission(PERMISSIONS.VENDOR_DELETE); // Using DELETE permission for archiving
    if (error) return { success: false, error };

    const vendor = await prisma.vendor.findUnique({ where: { id } });
    if (!vendor) return { success: false, error: "Vendor not found" };

    await prisma.vendor.update({
      where: { id },
      data: { isArchived: true }
    });
    
    await createDeleteAuditLog(session!.userId, "Vendor", id, { vendorName: vendor.vendorName }, "ARCHIVE");
    revalidatePath("/admin/vendors");
    revalidatePath("/admin/budget");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function restoreVendor(id: string) {
  try {
    const { session, error } = await checkDeletePermission(PERMISSIONS.VENDOR_DELETE); // Using DELETE permission for restoring
    if (error) return { success: false, error };

    await prisma.vendor.update({
      where: { id },
      data: { isArchived: false }
    });
    
    await createDeleteAuditLog(session!.userId, "Vendor", id, {}, "RESTORE");
    revalidatePath("/admin/vendors");
    revalidatePath("/admin/budget");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
