import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

interface Props {
  searchParams: Promise<{ eventId?: string }>;
}

export default async function EventPlanPrintPage({ searchParams }: Props) {
  const { eventId } = await searchParams;

  if (!eventId) {
    return notFound();
  }

  const event = await prisma.ceremonyEvent.findUnique({
    where: { id: eventId }
  });

  if (!event) {
    return notFound();
  }

  const planItems = await prisma.eventPlanItem.findMany({
    where: { eventId },
    orderBy: { sortOrder: 'asc' }
  });

  const eventDate = event.eventDate 
    ? new Date(event.eventDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase()
    : "";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Sinhala:wght@400;700&display=swap');

        *, *::before, *::after {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        html {
          background: #f0f0f0;
        }

        body {
          font-family: "Noto Sans Sinhala", Arial, sans-serif;
          background: #f0f0f0;
          color: #1a1a1a;
          line-height: 1.6;
        }

        /* ── Screen styles ─────────────────────────────── */

        .page-wrapper {
          max-width: 794px;
          margin: 24px auto;
          background: #ffffff;
          box-shadow: 0 2px 16px rgba(0,0,0,.15);
          border-radius: 4px;
          overflow: hidden;
        }

        /* Print toolbar */
        .print-toolbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 999;
          background: #1e2333;
          padding: 10px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .print-toolbar-label {
          color: #aaa;
          font-size: 13px;
          font-family: system-ui, sans-serif;
        }

        .print-btn {
          background: #10b981;
          color: #fff;
          border: none;
          padding: 8px 20px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          font-family: system-ui, sans-serif;
        }

        .print-btn:hover { background: #059669; }

        @media screen {
          body { padding-top: 50px; }
        }

        /* ── Document content ─────────────────────────── */

        .doc-header {
          background: #10233B;
          color: #ffffff;
          padding: 40px;
          text-align: center;
        }

        .doc-brand {
          font-family: Georgia, "Times New Roman", serif;
          font-size: 26px;
          font-weight: 700;
          letter-spacing: 2px;
          margin-bottom: 8px;
        }

        .doc-subtitle {
          font-family: Georgia, "Times New Roman", serif;
          font-size: 16px;
          color: #D7B56D;
          letter-spacing: 1.5px;
          margin-bottom: 8px;
        }

        .doc-meta {
          font-family: Georgia, "Times New Roman", serif;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.8);
        }

        /* ── Items Table ────────────────────────────────────── */

        .table-container {
          padding: 40px;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        tr:nth-child(even) {
          background-color: #F8F2E8; /* Ivory */
        }

        td {
          padding: 12px 16px;
          font-size: 15px;
          border-bottom: 1px solid rgba(0,0,0,0.05);
          break-inside: avoid;
          page-break-inside: avoid;
        }

        .col-index {
          width: 50px;
          color: #969696;
          font-weight: 700;
          font-family: Georgia, serif;
        }

        .col-activity {
          font-family: "Noto Sans Sinhala", Arial, sans-serif;
          font-weight: 700;
          color: #10233B;

          /* Sinhala-safe typography */
          letter-spacing: normal;
          word-spacing: normal;
          word-break: normal;
          overflow-wrap: normal;
          white-space: normal;
          font-kerning: normal;
        }

        .col-time {
          width: 100px;
          text-align: right;
          color: #D7B56D;
          font-weight: 700;
          font-family: Georgia, serif;
        }

        .empty-state {
          text-align: center;
          color: #9CA3AF;
          font-style: italic;
          padding: 40px;
        }

        /* ── Print overrides ──────────────────────────── */

        @page {
          size: A4 portrait;
          margin: 0; /* Header spans full width */
        }

        @media print {
          html { background: #fff; }
          body { background: #fff; padding-top: 0; }

          .print-toolbar { display: none !important; }

          .page-wrapper {
            margin: 0;
            box-shadow: none;
            border-radius: 0;
            max-width: none;
          }

          .table-container {
            padding: 20px 40px;
          }
          
          tr {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>

      <div className="print-toolbar">
        <span className="print-toolbar-label">
          Event Plan Print Preview — {event.name}
        </span>
        <button
          className="print-btn"
          id="print-trigger"
        >
          🖨 Print / Save as PDF
        </button>
      </div>

      <div className="page-wrapper">
        <div className="doc-header">
          <div className="doc-brand">CHATHURYA &amp; OSHADI</div>
          <div className="doc-subtitle">{event.name.toUpperCase()} DAY PLAN</div>
          {eventDate && <div className="doc-meta">{eventDate}</div>}
        </div>

        <div className="table-container">
          {planItems.length === 0 ? (
            <div className="empty-state">No activities planned yet.</div>
          ) : (
            <table>
              <tbody>
                {planItems.map((item, idx) => (
                  <tr key={item.id}>
                    <td className="col-index">{(idx + 1).toString().padStart(2, '0')}</td>
                    <td className="col-activity">{item.activity}</td>
                    <td className="col-time">{item.plannedTime || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <script dangerouslySetInnerHTML={{ __html: `
        document.getElementById('print-trigger').addEventListener('click', async function() {
          this.textContent = 'Preparing…';
          this.disabled = true;
          try {
            await document.fonts.ready;
            await new Promise(function(r) { requestAnimationFrame(function() { requestAnimationFrame(r); }); });
            window.print();
          } finally {
            this.textContent = '🖨 Print / Save as PDF';
            this.disabled = false;
          }
        });
      `}} />
    </>
  );
}
