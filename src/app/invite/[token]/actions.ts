"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function submitRSVP(
  invitationCode: string,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const attendanceRaw = formData.get("attendance") as string;
  const confirmedGuestCountRaw = formData.get("confirmedGuestCount") as string;
  const liquorCountRaw = formData.get("liquorCount") as string | null;

  if (!attendanceRaw) {
    return { success: false, error: "Please select your attendance." };
  }

  const validStatuses = ["ATTENDING", "NOT_ATTENDING", "NOT_SURE"];
  if (!validStatuses.includes(attendanceRaw)) {
    return { success: false, error: "Invalid attendance selection." };
  }

  // Fetch the guest from DB to get their allowedGuestCount for server-side validation
  const guest = await prisma.guest.findUnique({
    where: { invitationCode },
  });

  if (!guest) {
    return { success: false, error: "Invitation not found." };
  }

  let confirmedGuestCount = guest.confirmedGuestCount;
  let liquorCount = guest.liquorCount;

  if (attendanceRaw === "ATTENDING") {
    const parsed = parseInt(confirmedGuestCountRaw, 10);

    // Server-side validation: count must be between 1 and allowedGuestCount
    if (isNaN(parsed) || parsed < 1) {
      return { success: false, error: "Please enter a valid guest count." };
    }
    if (parsed > guest.allowedGuestCount) {
      return {
        success: false,
        error: `Guest count cannot exceed your invitation limit of ${guest.allowedGuestCount}.`,
      };
    }
    confirmedGuestCount = parsed;

    if (liquorCountRaw !== null && liquorCountRaw !== "") {
      const parsedLiquor = parseInt(liquorCountRaw, 10);
      if (isNaN(parsedLiquor) || parsedLiquor < 0) {
        return { success: false, error: "Please enter a valid liquor count." };
      }
      if (parsedLiquor > confirmedGuestCount) {
        return {
          success: false,
          error: "Liquor count cannot exceed confirmed guest count."
        };
      }
      liquorCount = parsedLiquor;
    }
  } else {
    confirmedGuestCount = 0;
    liquorCount = 0;
  }

  // Determine invitation status from attendance
  const invitationStatus =
    attendanceRaw === "ATTENDING"
      ? "CONFIRMED"
      : attendanceRaw === "NOT_ATTENDING"
        ? "DECLINED"
        : "RSVP_PENDING";

  await prisma.guest.update({
    where: { invitationCode },
    data: {
      rsvpStatus: attendanceRaw,
      confirmedGuestCount,
      liquorCount,
      invitationStatus,
    },
  });

  revalidatePath(`/invite/${invitationCode}`);
  return { success: true };
}
