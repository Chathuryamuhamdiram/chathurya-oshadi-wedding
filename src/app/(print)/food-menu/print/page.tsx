import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

interface Props {
  searchParams: Promise<{ menuId?: string }>;
}

export default async function FoodMenuPrintPage({ searchParams }: Props) {
  const { menuId } = await searchParams;

  if (!menuId) {
    return notFound();
  }

  const menu = await prisma.foodMenu.findUnique({
    where: { id: menuId },
    include: {
      sections: {
        orderBy: { sortOrder: "asc" },
        include: {
          items: { orderBy: { sortOrder: "asc" } }
        }
      },
      vendor: true,
      event: true
    }
  });

  if (!menu) {
    return notFound();
  }

  const eventName = menu.event?.name ?? "Unknown";
  const generated = new Date().toLocaleDateString("en-GB");

  return (
    <>
      {/*
        This page is intentionally a plain white document.
        All styles are inline or via <style> to avoid any
        global CSS interference.
        Font-family uses Noto Sans Sinhala loaded from
        /public/fonts/ — no CDN dependency.
      */}
      <style>{`
        @font-face {
          font-family: "Noto Sans Sinhala";
          src: url("/fonts/NotoSansSinhala-Regular.ttf") format("truetype");
          font-weight: 400;
          font-style: normal;
          font-display: block;
        }

        *, *::before, *::after {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        html {
          background: #f0f0f0;
        }

        body {
          font-family: "Noto Sans Sinhala", "Noto Sans", Arial, sans-serif;
          background: #f0f0f0;
          color: #1a1a1a;
          line-height: 1.6;
        }

        /* ── Screen styles ─────────────────────────────── */

        .page-wrapper {
          max-width: 794px;
          margin: 24px auto;
          background: #ffffff;
          padding: 56px 60px;
          box-shadow: 0 2px 16px rgba(0,0,0,.15);
          border-radius: 4px;
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

        /* Extra top margin on screen to clear the toolbar */
        @media screen {
          body { padding-top: 50px; }
        }

        /* ── Document content ─────────────────────────── */

        .doc-header {
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 20px;
          margin-bottom: 32px;
        }

        .doc-brand {
          font-family: Georgia, "Times New Roman", serif;
          font-size: 26px;
          font-weight: 700;
          color: #10233B;
          letter-spacing: 1px;
          line-height: 1.2;
        }

        .doc-subtitle {
          font-family: Georgia, "Times New Roman", serif;
          font-size: 12px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #D7B56D;
          margin-top: 4px;
          margin-bottom: 16px;
        }

        .doc-meta {
          font-family: Georgia, "Times New Roman", serif;
          font-size: 12px;
          color: #6b7280;
          line-height: 1.8;
        }

        /* ── Sections ─────────────────────────────────── */

        .menu-section {
          margin-bottom: 28px;
          break-inside: avoid;
          page-break-inside: avoid;
        }

        .section-title {
          font-family: Georgia, "Times New Roman", serif;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: #10233B;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 6px;
          margin-bottom: 10px;
          break-after: avoid;
          page-break-after: avoid;
        }

        /* ── Items ────────────────────────────────────── */

        .menu-item-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .menu-item {
          font-family: "Noto Sans Sinhala", "Noto Sans", Arial, sans-serif;
          font-size: 15px;
          font-weight: 400;
          color: #374151;
          padding: 7px 0;
          border-bottom: 1px solid #f3f4f6;
          break-inside: avoid;
          page-break-inside: avoid;

          /* Sinhala-safe typography — do NOT change these */
          letter-spacing: normal;
          word-spacing: normal;
          word-break: normal;
          overflow-wrap: normal;
          white-space: normal;
          line-height: 1.7;
          text-rendering: optimizeLegibility;
          font-kerning: normal;
        }

        .menu-item-empty {
          font-style: italic;
          color: #9ca3af;
          font-size: 12px;
        }

        /* ── Print overrides ──────────────────────────── */

        @page {
          size: A4 portrait;
          margin: 16mm;
        }

        @media print {
          html { background: #fff; }
          body { background: #fff; padding-top: 0; }

          .print-toolbar { display: none !important; }

          .page-wrapper {
            margin: 0;
            padding: 0;
            box-shadow: none;
            border-radius: 0;
            max-width: none;
          }

          .menu-section {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .section-title {
            break-after: avoid;
            page-break-after: avoid;
          }

          .menu-item {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>

      {/* Print toolbar — hidden in print output */}
      <div className="print-toolbar">
        <span className="print-toolbar-label">
          Food Menu Print Preview — {eventName}
        </span>
        <button
          className="print-btn"
          id="print-trigger"
        >
          🖨 Print / Save as PDF
        </button>
      </div>

      <div className="page-wrapper">
        {/* Header */}
        <div className="doc-header">
          <div className="doc-brand">CHATHURYA &amp; OSHADI</div>
          <div className="doc-subtitle">Food Menu</div>
          <div className="doc-meta">
            <div>Event: {eventName}</div>
            <div>Generated: {generated}</div>
            {menu.title && <div>Menu: {menu.title}</div>}
            {menu.venue && <div>Venue: {menu.venue}</div>}
            {menu.vendor?.vendorName && <div>Caterer: {menu.vendor.vendorName}</div>}
          </div>
        </div>

        {/* Sections */}
        {menu.sections.map((section) => (
          <div key={section.id} className="menu-section">
            <div className="section-title">{section.title}</div>
            <ul className="menu-item-list">
              {section.items.length === 0 && (
                <li className="menu-item menu-item-empty">No items in this section</li>
              )}
              {section.items.map((item) => (
                <li key={item.id} className="menu-item">
                  {/* 
                    item.name is passed DIRECTLY from the database.
                    No string manipulation. No normalization.
                    No character splitting.
                    The browser's native HarfBuzz engine renders this.
                  */}
                  {item.name}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/*
        Wait for fonts, then bind the print button.
        This keeps Sinhala rendering in the browser's native engine.
        No canvas. No PDF library text drawing.
      */}
      <script dangerouslySetInnerHTML={{ __html: `
        document.getElementById('print-trigger').addEventListener('click', async function() {
          this.textContent = 'Preparing…';
          this.disabled = true;
          try {
            await document.fonts.ready;
            // Extra frame to ensure Sinhala ligatures are fully composed
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
