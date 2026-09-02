"use server";

import { prisma } from "@/lib/db";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

const UPLOAD_DIR = join(process.cwd(), "public", "uploads", "assets");

export async function uploadSiteAsset(key: string, formData: FormData) {
  try {
    const file = formData.get("file") as File;
    if (!file) throw new Error("No file uploaded");

    // Ensure upload directory exists
    try {
      await import("fs/promises").then(fs => fs.mkdir(UPLOAD_DIR, { recursive: true }));
    } catch (e) {
      // Ignore if directory already exists
    }

    // Read file buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Convert to Base64 Data URI instead of writing to Vercel read-only filesystem
    const mimeType = file.type || "image/jpeg";
    const base64Data = buffer.toString("base64");
    const url = `data:${mimeType};base64,${base64Data}`;

    // Find existing asset to delete old file if it exists
    const existingAsset = await prisma.siteAsset.findUnique({
      where: { key }
    });

    if (existingAsset && existingAsset.url.startsWith('/uploads/')) {
      // Try to delete old file
      try {
        const oldFilepath = join(process.cwd(), "public", existingAsset.url);
        await unlink(oldFilepath);
      } catch (err) {
        console.warn(`Could not delete old file for ${key}:`, err);
      }
    }

    // Update or create DB record
    await prisma.siteAsset.upsert({
      where: { key },
      update: { url },
      create: { key, url }
    });

    revalidatePath("/");
    revalidatePath("/admin/assets");
    revalidatePath("/invite/[token]", "page");

    return { success: true, url };
  } catch (error: any) {
    console.error("Error uploading asset:", error);
    return { success: false, error: error.message || "Failed to upload asset" };
  }
}
