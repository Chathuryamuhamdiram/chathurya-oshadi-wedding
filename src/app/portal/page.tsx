import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CheckCircle2, Clock, FileText } from "lucide-react";

export default async function PortalTasksPage() {
  const sessionCookie = (await cookies()).get("admin_session")?.value;
  if (!sessionCookie) redirect("/login");

  const payload = await verifyJWT(sessionCookie);
  if (!payload) redirect("/login");

  // Fetch tasks assigned to this user
  const tasks = await prisma.task.findMany({
    where: { assignedUserId: payload.userId },
    orderBy: { dueDate: 'asc' },
    include: {
      comments: true,
      attachments: true,
    }
  });

  const pendingTasks = tasks.filter(t => t.status !== "COMPLETED" && t.status !== "CANCELLED");
  const completedTasks = tasks.filter(t => t.status === "COMPLETED");

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#e2d8c3]">
        <h2 className="font-serif text-xl font-bold text-[#10233b] mb-1">My Tasks</h2>
        <p className="text-sm text-[#9a8060]">You have {pendingTasks.length} pending tasks to complete.</p>
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-[#9a8060] ml-1">To Do</h3>
        
        {pendingTasks.length === 0 ? (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#e2d8c3] border-dashed text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-50" />
            <p className="text-sm text-gray-500">All caught up! No pending tasks.</p>
          </div>
        ) : (
          pendingTasks.map(task => (
            <div key={task.id} className="bg-white p-4 rounded-2xl shadow-sm border border-[#e2d8c3] hover:border-[#c3a367] transition-colors relative overflow-hidden group">
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${task.priority === 'HIGH' || task.priority === 'CRITICAL' ? 'bg-red-400' : 'bg-[#c3a367]'}`}></div>
              <div className="flex justify-between items-start pl-2">
                <div>
                  <h4 className="font-bold text-[#10233b]">{task.title}</h4>
                  {task.description && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{task.description}</p>
                  )}
                  
                  <div className="flex items-center gap-3 mt-3 text-xs text-gray-500 font-semibold">
                    {task.dueDate && (
                      <span className="flex items-center gap-1 text-orange-600 bg-orange-50 px-2 py-1 rounded-md">
                        <Clock size={12} />
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <FileText size={12} /> {task.comments.length} comments
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <span className="text-[9px] uppercase tracking-wider bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-bold">
                    {task.status.replace("_", " ")}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {completedTasks.length > 0 && (
        <div className="space-y-4 pt-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Completed</h3>
          {completedTasks.map(task => (
            <div key={task.id} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 opacity-70">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <h4 className="font-bold text-gray-600 line-through decoration-gray-400">{task.title}</h4>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
