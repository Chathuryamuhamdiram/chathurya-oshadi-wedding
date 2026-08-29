import { prisma } from "@/lib/db";
import Link from "next/link";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/auth";
import { TaskForm } from "./TaskForm";
import { CheckSquare, AlertCircle, Clock, Calendar as CalendarIcon, ArrowUp, ArrowDown } from "lucide-react";

type PageProps = {
  searchParams: Promise<{ sort?: string; order?: string }>;
};

export default async function AdminTasksPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const sort = searchParams.sort || 'dueDate';
  const order = searchParams.order === 'desc' ? 'desc' : 'asc';

  let orderBy: any = {};
  if (sort === 'assignee') {
    orderBy = { assignedUser: { fullName: order } };
  } else if (['title', 'category', 'priority', 'dueDate', 'status'].includes(sort)) {
    orderBy = { [sort]: order };
  } else {
    orderBy = [{ dueDate: 'asc' }, { priority: 'desc' }];
  }
  
  const sessionCookie = (await cookies()).get("admin_session")?.value;
  let userRole = "VIEWER";
  let userId = "";
  if (sessionCookie) {
    const payload = await verifyJWT(sessionCookie);
    if (payload) {
      userRole = payload.role as string;
      userId = payload.userId as string;
    }
  }

  const tasks = await prisma.task.findMany({
    where: userRole === "FAMILY_MEMBER" ? { assignedUserId: userId } : undefined,
    include: { assignedUser: true },
    orderBy
  });

  const users = await prisma.user.findMany({
    orderBy: { fullName: 'asc' }
  });

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === "COMPLETED").length;
  const pendingTasks = totalTasks - completedTasks;
  
  const now = new Date();
  const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  const dueThisWeek = tasks.filter(t => 
    t.status !== "COMPLETED" && 
    t.dueDate && 
    new Date(t.dueDate) >= now && 
    new Date(t.dueDate) <= next7Days
  ).length;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "CRITICAL": return "bg-red-500/10 text-red-400 border-red-500/20";
      case "HIGH": return "bg-orange-500/10 text-orange-400 border-orange-500/20";
      case "MEDIUM": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "LOW": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      default: return "bg-white/5 text-white/40 border-white/10";
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-wide">Task Management</h1>
          <p className="text-white/50 text-sm mt-1">Collaborate with your family and vendors to stay on track.</p>
        </div>
        <div className="flex items-center gap-4">
          <TaskForm users={users} />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#1e2333] border border-white/5 rounded-2xl p-6 flex flex-col justify-between h-[140px] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
          <div className="flex items-center gap-2 text-white/50 text-sm font-medium tracking-wide">
            <AlertCircle className="w-4 h-4" /> Tasks Remaining
          </div>
          <div className="text-3xl font-semibold text-amber-400 mt-auto">
            {pendingTasks}
          </div>
        </div>
        
        <div className="bg-[#1e2333] border border-white/5 rounded-2xl p-6 flex flex-col justify-between h-[140px] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
          <div className="flex items-center gap-2 text-white/50 text-sm font-medium tracking-wide">
            <Clock className="w-4 h-4" /> Due This Week
          </div>
          <div className="text-3xl font-semibold text-red-400 mt-auto">
            {dueThisWeek}
          </div>
        </div>

        <div className="bg-[#1e2333] border border-white/5 rounded-2xl p-6 flex flex-col justify-between h-[140px] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
          <div className="flex items-center gap-2 text-white/50 text-sm font-medium tracking-wide">
            <CheckSquare className="w-4 h-4" /> Completed
          </div>
          <div className="text-3xl font-semibold text-emerald-400 mt-auto">
            {completedTasks} <span className="text-lg text-white/30">/ {totalTasks}</span>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="bg-[#1e2333] border border-white/5 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 bg-white/[0.02] border-b border-white/5 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white/70 uppercase tracking-widest">Master Task List</h2>
        </div>
        
        {tasks.length === 0 ? (
          <div className="bg-white/5 p-12 text-center">
            <CheckSquare className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No Tasks Yet</h3>
            <p className="text-white/40 text-sm">Add your first task to start organizing your wedding.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="text-white/30 text-xs uppercase tracking-widest border-b border-white/5">
                  <th className="px-6 py-4 font-medium">
                    <SortableHeader label="Task Details" sortKey="title" currentSort={sort} currentOrder={order} />
                  </th>
                  <th className="px-6 py-4 font-medium">
                    <SortableHeader label="Category" sortKey="category" currentSort={sort} currentOrder={order} />
                  </th>
                  <th className="px-6 py-4 font-medium">
                    <SortableHeader label="Priority" sortKey="priority" currentSort={sort} currentOrder={order} />
                  </th>
                  <th className="px-6 py-4 font-medium">
                    <SortableHeader label="Status" sortKey="status" currentSort={sort} currentOrder={order} />
                  </th>
                  <th className="px-6 py-4 font-medium">
                    <SortableHeader label="Due Date" sortKey="dueDate" currentSort={sort} currentOrder={order} />
                  </th>
                  <th className="px-6 py-4 font-medium">
                    <SortableHeader label="Assignee" sortKey="assignee" currentSort={sort} currentOrder={order} />
                  </th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => {
                  const isCompleted = task.status === "COMPLETED";
                  return (
                    <tr key={task.id} className={`border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors group ${isCompleted ? 'opacity-50' : ''}`}>
                      <td className="px-6 py-4">
                        <div className={`font-medium ${isCompleted ? 'text-white/50 line-through' : 'text-white/90'}`}>
                          {task.title}
                        </div>
                        {task.description && (
                          <div className="text-xs text-white/40 mt-1 max-w-[300px] truncate">
                            {task.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-white/50">
                        {task.category || "General"}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {isCompleted ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                            Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium border bg-amber-500/10 text-amber-400 border-amber-500/20">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {task.dueDate ? (
                          <div className={`flex items-center gap-1.5 ${
                            !isCompleted && new Date(task.dueDate) < now ? 'text-red-400' : 'text-white/70'
                          }`}>
                            <CalendarIcon className="w-3.5 h-3.5" />
                            {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                        ) : (
                          <span className="text-white/20">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {task.assignedUser ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] text-white font-bold">
                              {task.assignedUser.fullName.charAt(0)}
                            </div>
                            <span className="text-white/70">{task.assignedUser.fullName}</span>
                          </div>
                        ) : (
                          <span className="text-white/30 italic text-xs">Unassigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/tasks/${task.id}`} className="text-xs text-white/50 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded border border-white/5 transition-colors">
                            Details
                          </Link>
                          <TaskForm users={users} existingTask={task} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function SortableHeader({ 
  label, 
  sortKey, 
  currentSort, 
  currentOrder 
}: { 
  label: string, 
  sortKey: string, 
  currentSort: string, 
  currentOrder: string 
}) {
  const isSorted = currentSort === sortKey;
  const newOrder = isSorted && currentOrder === 'asc' ? 'desc' : 'asc';
  
  return (
    <Link 
      href={`/admin/tasks?sort=${sortKey}&order=${newOrder}`}
      className="inline-flex items-center gap-1 hover:text-white transition-colors group"
    >
      {label}
      <span className={`flex flex-col ${isSorted ? 'text-emerald-400' : 'text-white/20 group-hover:text-white/50'}`}>
        <ArrowUp className={`w-3 h-3 -mb-1 ${isSorted && currentOrder === 'asc' ? 'opacity-100' : 'opacity-40'}`} />
        <ArrowDown className={`w-3 h-3 ${isSorted && currentOrder === 'desc' ? 'opacity-100' : 'opacity-40'}`} />
      </span>
    </Link>
  );
}
