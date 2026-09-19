import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium-min";

export async function GET(request: Request) {
  let browser = null;
  try {
    const session = await requirePermission(PERMISSIONS.MENU_VIEW);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const menuId = searchParams.get("menuId");

    if (!menuId) {
      return new NextResponse("Menu ID is required", { status: 400 });
    }

    const menu = await prisma.foodMenu.findUnique({
      where: { id: menuId },
      include: { event: true }
    });

    if (!menu) {
      return new NextResponse("Menu not found", { status: 404 });
    }

    // Determine base URL dynamically depending on environment
    const protocol = request.headers.get("x-forwarded-proto") || "http";
    const host = request.headers.get("host");
    const baseUrl = `${protocol}://${host}`;
    const printUrl = `${baseUrl}/food-menu/print?menuId=${menuId}`;

    // Configure Sparticuz Chromium for Vercel Serverless
    const executablePath = await chromium.executablePath("https://github.com/Sparticuz/chromium/releases/download/v123.0.1/chromium-v123.0.1-pack.tar");
    
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: executablePath || process.env.PUPPETEER_EXECUTABLE_PATH,
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    
    // Load the print view
    await page.goto(printUrl, { waitUntil: "networkidle0", timeout: 30000 });

    // Wait for the fonts to be ready inside the page to ensure Sinhala shapes correctly
    await page.evaluate(async () => {
      await document.fonts.ready;
      // Extra frame to guarantee rendering
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "16mm",
        right: "16mm",
        bottom: "16mm",
        left: "16mm"
      }
    });

    const safeEvent = (menu.event?.name || "Wedding").toLowerCase().replace(/[^a-z0-9]+/g, "_");
    const safeMenu = (menu.title || "Menu").toLowerCase().replace(/[^a-z0-9]+/g, "_");
    const filename = `Chathurya_Oshadi_${safeEvent}_${safeMenu}.pdf`;

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error("Automated PDF Export failed:", error);
    return new NextResponse("Internal Server Error: " + error.message, { status: 500 });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
