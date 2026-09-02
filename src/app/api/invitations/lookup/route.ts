import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone } = body;

    if (!phone || typeof phone !== "string") {
      return NextResponse.json({ success: false, error: "Invalid phone number." }, { status: 400 });
    }

    // Normalize phone number (strip all non-numeric characters)
    let normalized = phone.replace(/\D/g, '');

    // Extract the last 9 digits (Standard Sri Lankan mobile number length)
    // E.g., +94712345678 -> 712345678
    // E.g., 0712345678 -> 712345678
    if (normalized.length < 9) {
      return NextResponse.json({ success: false, error: "Phone number is too short." }, { status: 400 });
    }
    
    const searchString = normalized.slice(-9);

    // Find all guests whose whatsappNumber ends with the last 9 digits
    const guests = await prisma.guest.findMany({
      where: {
        whatsappNumber: {
          endsWith: searchString,
        }
      },
      select: {
        invitationCode: true,
        displayName: true,
      }
    });

    if (guests.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: "We couldn't find an invitation linked to that number." 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      invitations: guests,
    });

  } catch (error) {
    console.error("Error looking up invitation:", error);
    return NextResponse.json({ success: false, error: "Server error during lookup." }, { status: 500 });
  }
}
