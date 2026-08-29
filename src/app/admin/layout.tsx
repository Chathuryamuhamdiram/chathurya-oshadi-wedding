import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/auth";
import AdminLayoutClient from "./AdminLayoutClient";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const sessionCookie = (await cookies()).get("admin_session")?.value;

  if (!sessionCookie) {
    redirect("/login");
  }

  const payload = await verifyJWT(sessionCookie);

  if (!payload) {
    redirect("/login");
  }

  const permissions = (payload.permissions as string[]) || [];

  return (
    <AdminLayoutClient 
      role={payload.role} 
      permissions={permissions}
    >
      {children}
    </AdminLayoutClient>
  );
}
