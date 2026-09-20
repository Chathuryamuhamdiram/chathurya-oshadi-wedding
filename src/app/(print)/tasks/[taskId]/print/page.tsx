import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function IndividualTaskPrintPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const resolvedParams = await params;
  const taskId = resolvedParams.taskId;

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      assignees: true,
      items: { orderBy: { createdAt: "asc" } },
      event: true
    }
  });

  if (!task) {
    return redirect("/admin/tasks");
  }

  const completedItems = task.items.filter(i => i.completed).length;
  const totalItems = task.items.length;
  const progressPct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <div style={{ padding: "40px", fontFamily: "'Noto Sans Sinhala', sans-serif", color: "#222" }}>
      <div style={{ borderBottom: "2px solid #000", paddingBottom: "20px", marginBottom: "30px" }}>
        <h1 style={{ fontSize: "32px", margin: "0 0 10px 0" }}>{task.title}</h1>
        <div style={{ display: "flex", gap: "20px", fontSize: "14px", color: "#555" }}>
           <p style={{ margin: 0 }}><strong>Event:</strong> {task.event?.name || "None"}</p>
           <p style={{ margin: 0 }}><strong>Status:</strong> {task.status.replace("_", " ")}</p>
           <p style={{ margin: 0 }}><strong>Priority:</strong> {task.priority}</p>
        </div>
        {task.description && (
          <p style={{ marginTop: "15px", fontSize: "15px", lineHeight: "1.5" }}>{task.description}</p>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "30px" }}>
        <div style={{ backgroundColor: "#f9f9f9", padding: "20px", borderRadius: "8px", border: "1px solid #ddd" }}>
          <h3 style={{ margin: "0 0 10px 0", fontSize: "14px", textTransform: "uppercase", color: "#666" }}>Schedule</h3>
          <p style={{ margin: "0 0 5px 0" }}><strong>Start Date:</strong> {task.startDate ? new Date(task.startDate).toLocaleDateString() : "Not set"}</p>
          <p style={{ margin: "0" }}><strong>Target Date:</strong> {task.targetDate ? new Date(task.targetDate).toLocaleDateString() : "Not set"}</p>
        </div>
        <div style={{ backgroundColor: "#f9f9f9", padding: "20px", borderRadius: "8px", border: "1px solid #ddd" }}>
          <h3 style={{ margin: "0 0 10px 0", fontSize: "14px", textTransform: "uppercase", color: "#666" }}>Assignees</h3>
          {task.assignees.length > 0 ? (
            <ul style={{ margin: 0, paddingLeft: "20px" }}>
               {task.assignees.map(a => (
                 <li key={a.id} style={{ marginBottom: "5px" }}>{a.fullName}</li>
               ))}
            </ul>
          ) : (
            <p style={{ margin: 0, fontStyle: "italic" }}>Unassigned</p>
          )}
        </div>
      </div>

      <div style={{ marginTop: "40px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: "1px solid #ddd", paddingBottom: "10px", marginBottom: "20px" }}>
           <h2 style={{ fontSize: "20px", margin: 0 }}>Checklist</h2>
           {totalItems > 0 && (
             <span style={{ fontSize: "14px", color: "#666" }}>Progress: {progressPct}% ({completedItems}/{totalItems})</span>
           )}
        </div>

        {totalItems > 0 ? (
          <ul style={{ listStyleType: "none", padding: 0, margin: 0 }}>
             {task.items.map(item => (
               <li key={item.id} style={{ 
                 display: "flex", 
                 alignItems: "flex-start", 
                 gap: "10px", 
                 padding: "10px", 
                 borderBottom: "1px solid #eee",
                 backgroundColor: item.completed ? "#f0fdf4" : "transparent"
               }}>
                  <div style={{
                    width: "16px",
                    height: "16px",
                    border: item.completed ? "none" : "1px solid #aaa",
                    backgroundColor: item.completed ? "#10b981" : "transparent",
                    borderRadius: "3px",
                    marginTop: "3px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: "12px"
                  }}>
                    {item.completed && "✓"}
                  </div>
                  <div style={{ flex: 1, fontSize: "15px", textDecoration: item.completed ? "line-through" : "none", color: item.completed ? "#888" : "#222" }}>
                    {item.name}
                  </div>
               </li>
             ))}
          </ul>
        ) : (
          <p style={{ color: "#666", fontStyle: "italic" }}>No checklist items added.</p>
        )}
      </div>
    </div>
  );
}
