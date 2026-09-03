import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { UserForm } from "./UserForm";
import { DeleteUserButton } from "./DeleteUserButton";

export default async function TeamDashboardPage() {
  const session = await getAdminSession();
  const isSuperAdmin = session?.role === "SUPER_ADMIN";

  const users = await prisma.user.findMany({
    include: { assignedTasks: true },
    orderBy: { fullName: 'asc' }
  });

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-white tracking-wide">Wedding Team</h1>
          <p className="text-white/40 text-sm font-sans mt-1">Manage family members and coordinators.</p>
        </div>
        <UserForm />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <div key={user.id} className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 min-w-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white text-lg font-bold shadow-lg shrink-0">
                  {user.fullName.charAt(0)}
                </div>
                <div className="min-w-0">
                  <h3 className="text-white/90 font-serif text-lg truncate">{user.fullName}</h3>
                  <p className="text-white/40 text-xs font-sans mt-0.5 uppercase tracking-widest truncate">{user.role.replace("_", " ")}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <UserForm existingUser={user} />
                {isSuperAdmin && <DeleteUserButton user={{ id: user.id, fullName: user.fullName }} />}
              </div>
            </div>
            <div className="border-t border-white/[0.06] pt-4">
              <p className="text-white/60 text-sm font-sans">
                {user.assignedTasks.length} {user.assignedTasks.length === 1 ? 'task' : 'tasks'} assigned
              </p>
            </div>
          </div>
        ))}
        {users.length === 0 && (
          <div className="col-span-full py-16 flex flex-col items-center justify-center border border-dashed border-white/[0.1] rounded-2xl">
            <p className="text-white/40 text-sm font-sans">No team members added yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
