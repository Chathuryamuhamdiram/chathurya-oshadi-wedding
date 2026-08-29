"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";

const userSchema = z.object({
  id: z.string().optional(),
  fullName: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().optional(),
  phone: z.string().optional(),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "FAMILY_MEMBER", "VIEWER"]),
}).refine((data) => {
  // Password is required for new users
  if (!data.id && (!data.password || data.password.length < 6)) {
    return false;
  }
  // If editing and password is provided, it must be >= 6 chars
  if (data.id && data.password && data.password.length < 6) {
    return false;
  }
  return true;
}, {
  message: "Password must be at least 6 characters",
  path: ["password"],
});

export async function toggleUserStatusAction(id: string) {
  try {
    await requirePermission(PERMISSIONS.USER_EDIT);
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new Error("User not found");
    
    await prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive }
    });
    revalidatePath("/admin/team");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function saveUserAction(formData: FormData) {
  try {
    await requirePermission(PERMISSIONS.USER_EDIT);
    const data = {
      id: formData.get("id") || undefined,
      fullName: formData.get("fullName"),
      email: formData.get("email"),
      password: formData.get("password") || undefined,
      phone: formData.get("phone") || "",
      role: formData.get("role") || "FAMILY_MEMBER",
    };

    const parsed = userSchema.parse(data);

    if (parsed.id) {
      // Update existing user
      const updateData: any = {
        fullName: parsed.fullName,
        email: parsed.email,
        phone: parsed.phone,
        role: parsed.role,
      };

      if (parsed.password) {
        updateData.passwordHash = await bcrypt.hash(parsed.password, 10);
      }

      await prisma.user.update({
        where: { id: parsed.id },
        data: updateData,
      });
    } else {
      // Create new user
      if (!parsed.password) throw new Error("Password is required for new users");
      const passwordHash = await bcrypt.hash(parsed.password, 10);
      
      await prisma.user.create({
        data: {
          fullName: parsed.fullName,
          email: parsed.email,
          passwordHash,
          phone: parsed.phone,
          role: parsed.role,
        }
      });
    }

    revalidatePath("/admin/team");
    revalidatePath("/admin/tasks");
    return { success: true };
  } catch (error: any) {
    console.error("User error:", error);
    return {
      success: false,
      error: error && typeof error === "object" && "errors" in error
        ? (error as any).errors.map((e: any) => e.message).join(", ")
        : error.message || "Failed to save user"
    };
  }
}
