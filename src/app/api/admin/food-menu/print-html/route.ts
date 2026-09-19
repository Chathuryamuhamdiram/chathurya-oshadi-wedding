import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const menuId = searchParams.get("menuId");

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
      <h3 class="section-title">${section.title}</h3>
      <ul class="item-list">
        ${section.items.map(item => `<li class="item">${item.name}</li>`).join('')}
        ${section.items.length === 0 ? '<li class="item empty">No items in this section</li>' : ''}
      </ul>
    </div>
  `).join('');

  const html = `<!DOCTYPE html>
<html lang="si">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Food Menu - ${menu.event?.name || 'Wedding'}</title>
  <style>
    @font-face {
      font-family: "Noto Sans Sinhala";
      src: url("/fonts/NotoSansSinhala-Regular.ttf") format("truetype");
      font-weight: 400;
      font-style: normal;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    html, body {
      width: 794px;
      background: #ffffff;
      font-family: "Noto Sans Sinhala", "Noto Sans", sans-serif;
      color: #1F2937;
      line-height: 1.65;
      letter-spacing: normal;
      word-spacing: normal;
      text-align: left;
    }

    .page {
      width: 794px;
      padding: 48px 56px;
      background: #ffffff;
    }

    .header {
      margin-bottom: 32px;
      padding-bottom: 20px;
      border-bottom: 2px solid #E5E7EB;
    }

    .title {
      font-size: 26px;
      font-weight: 700;
      color: #10233B;
      letter-spacing: 1px;
      margin-bottom: 4px;
    }

    .subtitle {
      font-size: 15px;
      font-weight: 400;
      color: #D7B56D;
      letter-spacing: 2px;
      margin-bottom: 16px;
    }

    .meta {
      font-size: 12px;
      color: #6B7280;
      line-height: 1.8;
    }

    .section {
      margin-bottom: 28px;
      page-break-inside: avoid;
    }

    .section-title {
      font-size: 13px;
      font-weight: 700;
      color: #10233B;
      text-transform: uppercase;
      letter-spacing: 1px;
      padding-bottom: 6px;
      margin-bottom: 10px;
      border-bottom: 1px solid #E5E7EB;
      page-break-after: avoid;
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
      bottom: 10px;
      right: 10px;
      font-size: 11px;
      color: #9CA3AF;
      font-family: monospace;
    }
  </style>
</head>
<body>
  <div class="page" id="print-root">
    <div class="header">
      <div class="title">CHATHURYA &amp; OSHADI</div>
      <div class="subtitle">FOOD MENU</div>
      <div class="meta">
        <div>Event: ${menu.event?.name || 'Unknown'}</div>
        <div>Generated: ${new Date().toLocaleDateString('en-GB')}</div>
        ${menu.title ? `<div>Menu: ${menu.title}</div>` : ''}
        ${menu.venue ? `<div>Venue: ${menu.venue}</div>` : ''}
        ${menu.vendor?.vendorName ? `<div>Caterer: ${menu.vendor.vendorName}</div>` : ''}
      </div>
    </div>
    <div class="sections">
      ${sectionsHtml}
    </div>
  </div>
  <div id="status">Loading fonts…</div>
  <script>
    // Signal to the opener window when this page is ready for capture
    window.addEventListener('load', async () => {
      await document.fonts.ready;
      const check = document.fonts.check('14px "Noto Sans Sinhala"');
      document.getElementById('status').textContent = 'Fonts ready: ' + check;
      // Notify opener
      if (window.opener && window.opener.__onPrintReady) {
        window.opener.__onPrintReady();
      }
      window.__printReady = true;
    });
  </script>
</body>
</html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" }
  });
}
