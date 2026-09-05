import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/auth";
import AdminLayoutClient from "./AdminLayoutClient";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getActiveEventId } from "@/lib/event-context";

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

  // Fetch all active ceremony events for the event selector
  const ceremonyEvents = await prisma.ceremonyEvent.findMany({
    where: { isActive: true },
    select: { id: true, name: true, eventType: true },
    orderBy: { createdAt: "asc" },
  });

  const activeEventId = await getActiveEventId();

  return (
    <AdminLayoutClient 
      role={payload.role} 
      permissions={permissions}
      ceremonyEvents={ceremonyEvents}
      activeEventId={activeEventId}
    >
      {children}
    </AdminLayoutClient>
  );
}
