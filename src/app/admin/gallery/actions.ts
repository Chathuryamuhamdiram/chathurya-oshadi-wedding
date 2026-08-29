"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

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
    const file = formData.get("file") as File;
    if (!file) {
      return { success: false, error: "No file uploaded" };
    }

    await ensureUploadDir();

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a unique filename
    const uniqueId = randomUUID();
    const extension = file.name.split('.').pop() || 'jpg';
    const fileName = `${uniqueId}.${extension}`;
    const filePath = join(UPLOAD_DIR, fileName);

    // Write file to public/uploads/gallery
    await writeFile(filePath, buffer);

    // Determine sort order
    const lastImage = await prisma.galleryImage.findFirst({
      orderBy: { sortOrder: 'desc' }
    });
    const nextSortOrder = lastImage ? lastImage.sortOrder + 1 : 0;

    // Save to database
    const dbRecord = await prisma.galleryImage.create({
      data: {
        url: `/uploads/gallery/${fileName}`,
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
    const image = await prisma.galleryImage.findUnique({ where: { id } });
    if (!image) return { success: false, error: "Image not found" };

    // Delete from DB
    await prisma.galleryImage.delete({ where: { id } });

    // Delete file
    const filePath = join(process.cwd(), "public", image.url);
    try {
      await unlink(filePath);
    } catch (e) {
      console.error("Failed to delete file from disk:", e);
      // We continue even if file deletion fails, as DB record is gone
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
