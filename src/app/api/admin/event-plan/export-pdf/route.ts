import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium-min";

export async function GET(request: Request) {
  let browser = null;
  try {
    const session = await requirePermission(PERMISSIONS.CALENDAR_VIEW);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return new NextResponse("Event ID is required", { status: 400 });
    }

    const event = await prisma.ceremonyEvent.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      return new NextResponse("Event not found", { status: 404 });
    }

    // Determine base URL dynamically depending on environment
    const protocol = request.headers.get("x-forwarded-proto") || "http";
    const host = request.headers.get("host");
    const baseUrl = `${protocol}://${host}`;
    const printUrl = `${baseUrl}/event-plan/print?eventId=${eventId}`;

    // Configure Sparticuz Chromium for Vercel Serverless
    const executablePath = await chromium.executablePath("https://github.com/Sparticuz/chromium/releases/download/v123.0.1/chromium-v123.0.1-pack.tar");
    
    const chromiumAny = chromium as any;
    
    browser = await puppeteer.launch({
      args: chromiumAny.args,
      defaultViewport: chromiumAny.defaultViewport,
      executablePath: executablePath || (process.env.PUPPETEER_EXECUTABLE_PATH as string),
      headless: chromiumAny.headless === true || chromiumAny.headless === 'new' ? true : chromiumAny.headless,
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
        top: "0mm",    // No top margin so the header touches the top
        right: "0mm",
        bottom: "16mm",
        left: "0mm"
      }
    });

    const safeEvent = (event.name || "Event").toLowerCase().replace(/[^a-z0-9]+/g, "_");
    const filename = `Chathurya_Oshadi_${safeEvent}_Day_Plan.pdf`;

    return new NextResponse(pdfBuffer as any, {
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
