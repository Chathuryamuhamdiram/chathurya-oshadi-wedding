import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const menuId = searchParams.get("menuId");
  const capture = searchParams.get("capture") === "true";

  if (!menuId) {
    return new Response("Missing menuId", { status: 400 });
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
    return new Response("Menu not found", { status: 404 });
  }

  const sectionsHtml = menu.sections.map(section => `
    <div class="section">
      <h3 class="section-title">${escapeHtml(section.title)}</h3>
      <ul class="item-list">
        ${section.items.map(item => `<li class="item">${escapeHtml(item.name)}</li>`).join('')}
        ${section.items.length === 0 ? '<li class="item empty">No items</li>' : ''}
      </ul>
    </div>
  `).join('');

  const eventName = escapeHtml(menu.event?.name || 'Unknown');
  const menuTitle = menu.title ? escapeHtml(menu.title) : '';
  const venue = menu.venue ? escapeHtml(menu.venue) : '';
  const caterer = menu.vendor?.vendorName ? escapeHtml(menu.vendor.vendorName) : '';
  const generated = new Date().toLocaleDateString('en-GB');

  // The capture script runs html2canvas inside this popup window and sends the image back.
  // Running html2canvas in THIS window (not in the parent) ensures the canvas context
  // has access to THIS document's loaded fonts — solving the Sinhala font fallback issue.
  const captureScript = capture ? `
  <script src="https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js"><\/script>
  <script>
    async function runCapture() {
      try {
        setStatus('Waiting for Noto Sans Sinhala...');
        
        // Wait for all fonts in THIS document to load
        await document.fonts.ready;
        
        // Explicitly check font is available
        let fontReady = document.fonts.check('16px "Noto Sans Sinhala"');
        
        // If not ready yet, wait up to 3 more seconds
        if (!fontReady) {
          for (let i = 0; i < 6; i++) {
            await new Promise(r => setTimeout(r, 500));
            fontReady = document.fonts.check('16px "Noto Sans Sinhala"');
            if (fontReady) break;
          }
        }
        
        setStatus('Font loaded: ' + fontReady + ' — rendering...');
        
        // Two render frames to ensure paint is complete
        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
        await new Promise(r => setTimeout(r, 300));
        
        const root = document.getElementById('print-root');
        
        // html2canvas runs in this popup's own context —
        // canvas.fillText() will use Noto Sans Sinhala as loaded in THIS document
        const canvas = await html2canvas(root, {
          scale: 2,
          useCORS: true,
          allowTaint: false,
          backgroundColor: '#ffffff',
          logging: false,
          width: root.scrollWidth,
          height: root.scrollHeight,
          windowWidth: 794,
        });
        
        setStatus('Canvas: ' + canvas.width + 'x' + canvas.height + ' — encoding...');
        
        if (canvas.width === 0 || canvas.height === 0) {
          throw new Error('Canvas is 0x0 — layout failed');
        }
        
        const imageData = canvas.toDataURL('image/jpeg', 0.95);
        
        setStatus('Sending to parent window...');
        
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage(
            { type: 'PDF_CANVAS_READY', imageData: imageData },
            window.location.origin
          );
        }
        
        setStatus('Done! Window will close.');
        setTimeout(() => window.close(), 500);
      } catch (err) {
        setStatus('ERROR: ' + err.message);
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage(
            { type: 'PDF_CANVAS_ERROR', error: err.message },
            window.location.origin
          );
        }
      }
    }
    
    function setStatus(msg) {
      var el = document.getElementById('status');
      if (el) el.textContent = msg;
      console.log('[PDF Capture]', msg);
    }
    
    window.addEventListener('load', runCapture);
  <\/script>
  ` : '';

  const html = `<!DOCTYPE html>
<html lang="si">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Food Menu — ${eventName}</title>
  <style>
    @font-face {
      font-family: "Noto Sans Sinhala";
      src: url("/fonts/NotoSansSinhala-Regular.ttf") format("truetype");
      font-weight: 400;
      font-style: normal;
      font-display: block;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    html, body {
      width: 794px;
      background: #ffffff;
    }

    #print-root {
      width: 794px;
      padding: 48px 56px;
      background: #ffffff;
      font-family: "Noto Sans Sinhala", "Noto Sans", sans-serif;
      color: #1F2937;
      line-height: 1.65;
      letter-spacing: normal;
      word-spacing: normal;
      text-align: left;
    }

    .header {
      margin-bottom: 32px;
      padding-bottom: 20px;
      border-bottom: 2px solid #E5E7EB;
    }

    .brand-title {
      font-size: 26px;
      font-weight: 700;
      color: #10233B;
      letter-spacing: 1px;
      margin-bottom: 4px;
      font-family: Georgia, serif;
    }

    .brand-subtitle {
      font-size: 13px;
      font-weight: 400;
      color: #D7B56D;
      letter-spacing: 3px;
      text-transform: uppercase;
      margin-bottom: 16px;
      font-family: Georgia, serif;
    }

    .meta {
      font-size: 12px;
      color: #6B7280;
      line-height: 1.8;
      font-family: Georgia, serif;
    }

    .section {
      margin-bottom: 28px;
      page-break-inside: avoid;
    }

    .section-title {
      font-size: 12px;
      font-weight: 700;
      color: #10233B;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      padding-bottom: 6px;
      margin-bottom: 10px;
      border-bottom: 1px solid #E5E7EB;
      page-break-after: avoid;
      font-family: Georgia, serif;
    }

    .item-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .item {
      font-size: 14px;
      color: #374151;
      padding: 7px 0;
      border-bottom: 1px solid #F3F4F6;
      page-break-inside: avoid;
      font-family: "Noto Sans Sinhala", "Noto Sans", sans-serif;
      letter-spacing: normal;
      word-spacing: normal;
      word-break: normal;
      overflow-wrap: normal;
      white-space: normal;
    }

    .item.empty {
      color: #9CA3AF;
      font-style: italic;
      font-size: 12px;
    }

    #status {
      position: fixed;
      bottom: 8px;
      right: 8px;
      font-size: 10px;
      color: #9CA3AF;
      font-family: monospace;
      background: rgba(0,0,0,0.05);
      padding: 2px 6px;
      border-radius: 3px;
      pointer-events: none;
    }
  </style>
</head>
<body>
  <div id="print-root">
    <div class="header">
      <div class="brand-title">CHATHURYA &amp; OSHADI</div>
      <div class="brand-subtitle">Food Menu</div>
      <div class="meta">
        <div>Event: ${eventName}</div>
        <div>Generated: ${generated}</div>
        ${menuTitle ? `<div>Menu: ${menuTitle}</div>` : ''}
        ${venue ? `<div>Venue: ${venue}</div>` : ''}
        ${caterer ? `<div>Caterer: ${caterer}</div>` : ''}
      </div>
    </div>
    <div class="sections">
      ${sectionsHtml}
    </div>
  </div>
  <div id="status">${capture ? 'Initialising…' : 'Preview'}</div>
  ${captureScript}
</body>
</html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" }
  });
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
