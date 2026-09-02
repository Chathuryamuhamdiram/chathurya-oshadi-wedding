import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const image = await prisma.galleryImage.findUnique({
      where: { id },
      select: { url: true }
    });

    if (!image) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const { url } = image;

    if (url.startsWith("data:")) {
      // e.g. data:image/jpeg;base64,...
      const matches = url.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return new NextResponse("Invalid image data", { status: 400 });
      }
      
      const mimeType = matches[1];
      const base64Data = matches[2];
      const buffer = Buffer.from(base64Data, "base64");

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Type": mimeType,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    } else {
      // It's a regular URL or relative path (e.g., /hero.jpg)
      // We can just redirect to it
      return NextResponse.redirect(new URL(url, request.url));
    }
  } catch (error) {
    console.error("Error fetching gallery image:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
