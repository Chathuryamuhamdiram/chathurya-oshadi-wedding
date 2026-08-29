import { prisma } from "@/lib/db";
import Link from "next/link";
import { redirect } from "next/navigation";
import { addComment, addDependency, removeDependency } from "./actions";

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  const task = await prisma.task.findUnique({
    where: { id: resolvedParams.id },
    include: {
      assignedUser: true,
      createdBy: true,
      comments: { include: { user: true }, orderBy: { createdAt: "desc" } },
      attachments: true,
      blockedBy: { include: { blockingTask: true } },
      blocks: { include: { blockedTask: true } }
    }
  });

  if (!task) return redirect("/admin/tasks");

  const allTasks = await prisma.task.findMany({
    where: { id: { not: task.id }, status: { notIn: ["COMPLETED", "CANCELLED"] } }
  });

  const users = await prisma.user.findMany();

  return (
    <div className="max-w-[1000px] mx-auto space-y-8 p-6">
      <div className="flex items-center justify-between">
        <Link href="/admin/tasks" className="text-white/50 hover:text-white mb-4 inline-block text-sm">
          ← Back to Tasks
        </Link>
        <span className="bg-white/10 px-3 py-1 rounded-full text-xs text-white/70 border border-white/20">
          Status: {task.status}
        </span>
      </div>

      <div className="bg-[#1e2333] border border-white/5 rounded-2xl p-8 relative">
        <Link href="/admin/tasks" className="absolute top-6 right-6 text-white/30 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
          </svg>
        </Link>
        <h1 className="text-3xl font-semibold text-white mb-2 pr-12">{task.title}</h1>
        <p className="text-white/60 mb-6">{task.description || "No description provided."}</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-y border-white/10 mb-8">
          <div>
            <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Assignee</p>
            <p className="text-white font-medium">{task.assignedUser?.fullName || "Unassigned"}</p>
          </div>
          <div>
            <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Due Date</p>
            <p className="text-white font-medium">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "None"}</p>
          </div>
          <div>
            <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Priority</p>
            <p className="text-white font-medium">{task.priority}</p>
          </div>
          <div>
            <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Category</p>
            <p className="text-white font-medium">{task.category || "General"}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Dependencies Section */}
          <div>
            <h3 className="text-lg font-medium text-white mb-4">Dependencies (Blocked By)</h3>
            <div className="space-y-3 mb-6">
              {task.blockedBy.length === 0 ? (
                <p className="text-white/40 text-sm">No blockers.</p>
              ) : (
                task.blockedBy.map(dep => (
                  <div key={dep.id} className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/10">
                    <span className="text-white/80 text-sm">{dep.blockingTask.title}</span>
                    <form action={async () => {
                      "use server";
                      await removeDependency(dep.id, task.id);
                    }}>
                      <button className="text-red-400 hover:text-red-300 text-xs px-2 py-1 bg-red-400/10 rounded">Remove</button>
                    </form>
                  </div>
                ))
              )}
            </div>

            <form action={async (formData) => {
              "use server";
              const blockedById = formData.get("blockedById") as string;
              if (blockedById) await addDependency(task.id, blockedById);
            }} className="flex gap-2">
              <select name="blockedById" className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30">
                <option value="">Add a dependency...</option>
                {allTasks.map(t => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
              <button type="submit" className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm border border-white/10 transition-colors">
                Add
              </button>
            </form>
          </div>

          {/* Comments Section */}
          <div>
            <h3 className="text-lg font-medium text-white mb-4">Discussion</h3>
            <div className="space-y-4 max-h-[300px] overflow-y-auto mb-6 pr-2">
              {task.comments.length === 0 ? (
                <p className="text-white/40 text-sm">No comments yet.</p>
              ) : (
                task.comments.map(c => (
                  <div key={c.id} className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <div className="flex justify-between items-center mb-2 text-xs">
                      <span className="font-medium text-white/80">{c.user.fullName}</span>
                      <span className="text-white/30">{new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-white/70 text-sm">{c.content}</p>
                  </div>
                ))
              )}
            </div>
            
            <form action={async (formData) => {
              "use server";
              const content = formData.get("content") as string;
              // Hardcoding admin user for now since we don't have auth session here yet
              // In production we get this from getServerSession()
              const admin = users[0];
              if (content && admin) await addComment(task.id, admin.id, content);
            }} className="flex flex-col gap-2">
              <textarea 
                name="content" 
                rows={3}
                placeholder="Write a comment..." 
                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-white/30 resize-none"
              />
              <div className="flex justify-end">
                <button type="submit" className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 px-4 py-2 rounded-lg text-sm transition-colors">
                  Post Comment
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
