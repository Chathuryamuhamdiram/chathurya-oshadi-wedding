import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { hasPermission, PermissionCode } from "./permissions";

const getSecretKey = () => {
  const secret = process.env.JWT_SECRET || "fallback-secret-wedding-app-2026";
  return new TextEncoder().encode(secret);
};

export async function signJWT(payload: { userId: string; role: string; email: string; permissions?: string[] }) {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 60 * 60 * 24 * 7; // 7 days expiration

  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(exp)
    .setIssuedAt(iat)
    .setNotBefore(iat)
    .sign(getSecretKey());
}

export async function verifyJWT(token: string) {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload as { userId: string; role: string; email: string; permissions?: string[]; exp: number };
  } catch (error) {
    return null;
  }
}

export async function getAdminSession() {
  const sessionCookie = (await cookies()).get("admin_session")?.value;
  if (!sessionCookie) return null;
  return await verifyJWT(sessionCookie);
}

export async function requirePermission(permissionCode: PermissionCode) {
  const session = await getAdminSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const role = session.role as string;
  const permissions = session.permissions || [];

  if (!hasPermission(role, permissions, permissionCode)) {
    throw new Error("Forbidden: You do not have permission to perform this action.");
  }

  return session;
}
