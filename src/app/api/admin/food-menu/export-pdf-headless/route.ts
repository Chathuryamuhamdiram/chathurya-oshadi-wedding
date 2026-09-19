import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium-min';

export const maxDuration = 30; // 30 seconds for Vercel

export async function POST(request: Request) {
  try {
    const { htmlContent } = await request.json();

    if (!htmlContent) {
      return NextResponse.json({ error: "Missing htmlContent" }, { status: 400 });
    }

    // Configure Sparticuz Chromium
    chromium.setGraphicsMode = false;
    
    const isLocal = process.env.NODE_ENV === 'development';
    
    // Let's use a robust local fallback for Windows/Mac:
    const localExecutable = process.platform === 'win32' 
      ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
      : process.platform === 'darwin'
      ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
      : '/usr/bin/google-chrome';

    const executablePath = isLocal 
      ? localExecutable 
      : await chromium.executablePath('https://github.com/Sparticuz/chromium/releases/download/v123.0.1/chromium-v123.0.1-pack.tar');
      
    let args: any = [];
    if (isLocal) {
      args = await puppeteer.defaultArgs();
    } else {
      const crArgs = await chromium.args;
      const baseArgs = Array.isArray(crArgs) ? crArgs : (Array.isArray(chromium.args) ? chromium.args : []);
      args = [...baseArgs, "--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"];
    }

    const browser = await puppeteer.launch({
      args: args,
      defaultViewport: null,
      executablePath,
      headless: true,
    });

    const page = await browser.newPage();

    // Set the HTML content
    await page.setContent(htmlContent, { waitUntil: 'load' });

    // Generate PDF
    const pdfUint8 = await page.pdf({
      format: 'A4',
      margin: {
        top: '15mm',
        right: '15mm',
        bottom: '15mm',
        left: '15mm',
      },
      printBackground: true,
      displayHeaderFooter: false,
    });
    
    const pdfBuffer = Buffer.from(pdfUint8);

    await browser.close();

    // Return the PDF as a binary stream
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="food-menu.pdf"',
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error("PDF Generation Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate PDF" }, { status: 500 });
  }
}
