"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";
import { checkDeletePermission, createDeleteAuditLog } from "@/lib/admin/delete-helpers";

const UPLOAD_DIR = join(process.cwd(), "public", "uploads", "gallery");

// Ensure the directory exists (In Next.js, doing this on the server start or action is necessary if it doesn't exist)
import { mkdir } from "fs/promises";
async function ensureUploadDir() {
  try {
    await mkdir(UPLOAD_DIR, { recursive: true });
  } catch (error) {
    console.error("Failed to create upload directory:", error);
  }
}

export async function uploadGalleryImage(formData: FormData) {
  try {
    await requirePermission(PERMISSIONS.GALLERY_MANAGE);
    const file = formData.get("file") as File;
    console.log("File from formData:", file);
    if (!file) {
      return { success: false, error: "No file uploaded" };
    }

    await ensureUploadDir();

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Instead of writing to the local file system (which is read-only on Vercel),
    // we convert the image to a Base64 Data URI and store it directly in the DB.
    const mimeType = file.type || "image/jpeg";
    const base64Data = buffer.toString("base64");
    const dataUri = `data:${mimeType};base64,${base64Data}`;

    // Determine sort order
    const lastImage = await prisma.galleryImage.findFirst({
      orderBy: { sortOrder: 'desc' }
    });
    const nextSortOrder = lastImage ? lastImage.sortOrder + 1 : 0;

    // Save to database
    const dbRecord = await prisma.galleryImage.create({
      data: {
        url: dataUri,
        altText: file.name,
        sortOrder: nextSortOrder,
      }
    });

    revalidatePath("/admin/gallery");
    revalidatePath("/");
    
    return { success: true, image: dbRecord };
  } catch (error) {
    console.error("Upload error:", error);
    return { success: false, error: "Failed to upload image" };
  }
}

export async function deleteGalleryImage(id: string) {
  try {
    const { session, error } = await checkDeletePermission(null); // null means SUPER_ADMIN only
    if (error) return { success: false, error };

    const image = await prisma.galleryImage.findUnique({ where: { id } });
    if (!image) return { success: false, error: "Image not found" };

    // Delete from DB
    await prisma.galleryImage.delete({ where: { id } });

    const auditUrl = image.url.startsWith("data:") ? "<base64_data>" : image.url;
    await createDeleteAuditLog(session!.userId, "GalleryImage", id, { url: auditUrl }, "DELETE");

    // Delete file if it's not a Base64 data URI
    if (!image.url.startsWith("data:")) {
      const filePath = join(process.cwd(), "public", image.url);
      try {
        await unlink(filePath);
      } catch (e) {
        console.error("Failed to delete file from disk:", e);
        // We continue even if file deletion fails, as DB record is gone
      }
    }

    revalidatePath("/admin/gallery");
    revalidatePath("/");
    
    return { success: true };
  } catch (error) {
    console.error("Delete error:", error);
    return { success: false, error: "Failed to delete image" };
  }
}

export async function updateGalleryImageOrder(items: { id: string; sortOrder: number }[]) {
  try {
    await requirePermission(PERMISSIONS.GALLERY_MANAGE);
    // We update in a transaction
    await prisma.$transaction(
      items.map((item) => 
        prisma.galleryImage.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder }
        })
      )
    );

    revalidatePath("/admin/gallery");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Order update error:", error);
    return { success: false, error: "Failed to update order" };
  }
}

export async function toggleGalleryImageStatus(id: string, isActive: boolean) {
  try {
    await requirePermission(PERMISSIONS.GALLERY_MANAGE);
    await prisma.galleryImage.update({
      where: { id },
      data: { isActive }
    });
    
    revalidatePath("/admin/gallery");
    revalidatePath("/");
    
    return { success: true };
  } catch (error) {
    console.error("Status update error:", error);
    return { success: false, error: "Failed to update status" };
  }
}
