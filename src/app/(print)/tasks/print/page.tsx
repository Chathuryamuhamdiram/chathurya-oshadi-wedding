import { prisma } from "@/lib/db";
import { ALL_EVENTS_VALUE } from "@/lib/event-context";

export const dynamic = "force-dynamic";

export default async function TaskListPrintPage({
  searchParams,
}: {
  searchParams: Promise<{ eventId?: string }>;
}) {
  const resolvedParams = await searchParams;
  const eventId = resolvedParams.eventId;

  const baseWhere: any = {};
  if (eventId && eventId !== ALL_EVENTS_VALUE) {
    baseWhere.eventId = eventId;
  }

  const tasks = await prisma.task.findMany({
    where: baseWhere,
    include: {
      assignees: true,
      items: true,
      event: true
    },
    orderBy: [{ targetDate: 'asc' }, { priority: 'desc' }]
  });

  let eventName = "All Events";
  if (eventId && eventId !== ALL_EVENTS_VALUE) {
    const event = await prisma.ceremonyEvent.findUnique({ where: { id: eventId }});
    if (event) eventName = event.name;
  }

  // Pre-load font to ensure HarfBuzz can use it
  return (
    <div style={{ padding: "40px", fontFamily: "'Noto Sans Sinhala', sans-serif" }}>
      <div style={{ borderBottom: "2px solid #000", paddingBottom: "20px", marginBottom: "30px" }}>
        <h1 style={{ fontSize: "28px", margin: "0 0 10px 0", color: "#111" }}>Task Master List</h1>
        <p style={{ fontSize: "16px", color: "#555", margin: 0 }}>Event: {eventName}</p>
        <p style={{ fontSize: "12px", color: "#888", margin: "5px 0 0 0" }}>Generated on: {new Date().toLocaleDateString()}</p>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
        <thead>
          <tr style={{ backgroundColor: "#f5f5f5" }}>
            <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "left" }}>Task</th>
            <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "left" }}>Category</th>
            <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "left" }}>Target Date</th>
            <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "left" }}>Assignees</th>
            <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "center" }}>Progress</th>
            <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "center" }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map(task => {
             const completedItems = task.items.filter(i => i.completed).length;
             const totalItems = task.items.length;
             const isCompleted = task.status === "COMPLETED";

             return (
               <tr key={task.id} style={{ opacity: isCompleted ? 0.6 : 1 }}>
                 <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                   <strong>{task.title}</strong>
                   {task.description && (
                     <div style={{ marginTop: "4px", color: "#666", fontSize: "11px" }}>{task.description}</div>
                   )}
                 </td>
                 <td style={{ padding: "12px", border: "1px solid #ddd" }}>{task.category || "-"}</td>
                 <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                   {task.targetDate ? new Date(task.targetDate).toLocaleDateString() : "-"}
                 </td>
                 <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                   {task.assignees.length > 0 ? task.assignees.map(a => a.fullName).join(", ") : "-"}
                 </td>
                 <td style={{ padding: "12px", border: "1px solid #ddd", textAlign: "center" }}>
                   {totalItems > 0 ? `${completedItems} / ${totalItems}` : "-"}
                 </td>
                 <td style={{ padding: "12px", border: "1px solid #ddd", textAlign: "center" }}>
                   {task.status.replace("_", " ")}
                 </td>
               </tr>
             )
          })}
        </tbody>
      </table>
    </div>
  );
}
