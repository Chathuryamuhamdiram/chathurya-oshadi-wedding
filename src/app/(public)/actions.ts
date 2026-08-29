"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function addGuestbookEntry(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const message = formData.get("message") as string;

    if (!name || !message) {
      return { success: false, error: "Name and message are required." };
    }

    await prisma.guestbookEntry.create({
      data: { name, message }
    });

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
