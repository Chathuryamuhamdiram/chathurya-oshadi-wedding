"use server";

import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { signJWT } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.passwordHash) {
      return { error: "Invalid email or password" };
    }

    if (!user.isActive) {
      return { error: "Your account is disabled" };
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      return { error: "Invalid email or password" };
    }

    // Fetch Role Permissions
    const rolePermissions = await prisma.rolePermission.findMany({
      where: { role: user.role, allowed: true },
      include: { permission: true }
    });

    // Fetch User Permissions (overrides)
    const userPermissionsQuery = await prisma.userPermission.findMany({
      where: { userId: user.id },
      include: { permission: true }
    });

    // Combine them (user overrides role)
    const permissionMap = new Map<string, boolean>();
    rolePermissions.forEach(rp => permissionMap.set(rp.permission.code, rp.allowed));
    userPermissionsQuery.forEach(up => permissionMap.set(up.permission.code, up.allowed));

    const finalPermissions: string[] = [];
    permissionMap.forEach((isAllowed, code) => {
      if (isAllowed) finalPermissions.push(code);
    });

    // Create JWT
    const token = await signJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
      permissions: finalPermissions,
    });

    // Set HTTP-only cookie
    (await cookies()).set("admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });
  } catch (err) {
    console.error("Login error:", err);
    return { error: "An error occurred during login. Please try again." };
  }

  // Redirect on success (outside try/catch because redirect throws an error that Next.js catches)
  redirect("/admin");
}

export async function logoutAction() {
  (await cookies()).delete("admin_session");
  redirect("/login");
}
