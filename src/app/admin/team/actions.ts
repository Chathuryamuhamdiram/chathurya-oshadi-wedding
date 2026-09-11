"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { requirePermission, getAdminSession } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";
import { createDeleteAuditLog } from "@/lib/admin/delete-helpers";

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
    await requirePermission(PERMISSIONS.USER_MANAGE);
    const session = await getAdminSession();
    
    if (session?.userId === id) {
      return { success: false, error: "You cannot deactivate your own account." };
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new Error("User not found");
    
    const newStatus = !user.isActive;
    
    await prisma.user.update({
      where: { id },
      data: { isActive: newStatus }
    });

    await createDeleteAuditLog(session!.userId, "User", id, { email: user.email }, newStatus ? "REACTIVATE" : "DEACTIVATE");

    revalidatePath("/admin/team");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function saveUserAction(formData: FormData) {
  try {
    await requirePermission(PERMISSIONS.USER_MANAGE);
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
      
      const createdUser = await prisma.user.create({
        data: {
          fullName: parsed.fullName,
          email: parsed.email,
          passwordHash,
          phone: parsed.phone,
          role: parsed.role,
        }
      });
      parsed.id = createdUser.id; // Assign ID so permissions can be saved below
    }

    // Process granular permissions if role is ADMIN
    if (parsed.role === "ADMIN") {
      const permsString = formData.get("permissions") as string;
      if (permsString && parsed.id) {
        const selectedPerms = JSON.parse(permsString) as string[];
        
        // 1. Ensure all these permissions exist in the Permission table
        for (const code of selectedPerms) {
          await prisma.permission.upsert({
            where: { code },
            update: {},
            create: { code, description: `Permission for ${code}` }
          });
        }

        // 2. Clear existing user permissions
        await prisma.userPermission.deleteMany({
          where: { userId: parsed.id }
        });

        // 3. Insert new user permissions
        // We need the IDs of the permission records to insert
        const dbPerms = await prisma.permission.findMany({
          where: { code: { in: selectedPerms } }
        });

        if (dbPerms.length > 0) {
          await prisma.userPermission.createMany({
            data: dbPerms.map(p => ({
              userId: parsed.id!,
              permissionId: p.id,
              allowed: true
            }))
          });
        }
      }
    } else if (parsed.id) {
      // If role is changed from ADMIN to something else, clear granular permissions
      await prisma.userPermission.deleteMany({
        where: { userId: parsed.id }
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

export async function deleteUserAction(id: string) {
  try {
    await requirePermission(PERMISSIONS.USER_MANAGE);
    const session = await getAdminSession();
    
    if (session?.userId === id) {
      return { success: false, error: "You cannot delete your own account." };
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return { success: false, error: "User not found." };
    }

    // Optional: Protect the last SUPER_ADMIN
    if (user.role === "SUPER_ADMIN") {
      const superAdmins = await prisma.user.count({ where: { role: "SUPER_ADMIN" } });
      if (superAdmins <= 1) {
        return { success: false, error: "Cannot delete the last SUPER_ADMIN." };
      }
    }

    await prisma.user.delete({ where: { id } });

    await createDeleteAuditLog(session!.userId, "User", id, { email: user.email }, "DELETE");

    revalidatePath("/admin/team");
    return { success: true };
  } catch (error: any) {
    console.error("Delete user error:", error);
    return { success: false, error: error.message || "Failed to delete user." };
  }
}
