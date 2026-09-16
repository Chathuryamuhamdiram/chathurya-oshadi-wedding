import { normalizeListItemText } from "@/lib/utils";

export type ParsedEventPlanItem = {
  activity: string;
  plannedTime: string | null;
  status: "NEW" | "DUPLICATE" | "SAME TIME";
  existingId?: string; // used for updating duplicates
  id: string; // temporary id for UI mapping
};

/**
 * Normalizes time format internally
 * E.g., 8.50 -> 08:50 AM
 */
function normalizeTime(timeStr: string): string {
  // basic cleanup
  let t = timeStr.trim().toUpperCase();
  t = t.replace(/\./g, ":");

  // check if it's already properly formatted e.g. "08:50 AM"
  if (t.includes("AM") || t.includes("PM")) {
    return t; // Trust the user's explicit AM/PM
  }

  // extract hours and minutes
  const match = t.match(/(\d{1,2}):(\d{2})/);
  if (match) {
    let hours = parseInt(match[1]);
    const minutes = match[2];
    
    // basic inference for AM/PM if not provided
    // If it's early (e.g. 1, 2, 3) it might be PM for a reception, but in 24hr format 13:00 is 1:00 PM.
    // We'll just append AM/PM based on a simple threshold or standard 24 hr parsing.
    let ampm = "AM";
    if (hours >= 12) {
      if (hours > 12) hours -= 12;
      ampm = "PM";
    }
    
    // Format hours to 2 digits
    const formattedHours = hours.toString().padStart(2, "0");
    return `${formattedHours}:${minutes} ${ampm}`;
  }
  
  return timeStr.trim(); // fallback
}

export function parseEventPlanText(text: string): ParsedEventPlanItem[] {
  if (!text.trim()) return [];

  const lines = text.split("\n").filter((l) => l.trim().length > 0);
  const items: ParsedEventPlanItem[] = [];

  for (const line of lines) {
    let raw = normalizeListItemText(line);
    if (!raw) continue;

    // Look for separators: - – —
    const parts = raw.split(/\s*[-–—]\s*/);

    let activity = raw;
    let plannedTime: string | null = null;

    if (parts.length >= 2) {
      // Typically: Activity - Time
      // Pop the last part as time, the rest is joined back for activity
      const possibleTime = parts.pop()!;
      activity = parts.join(" - "); // rejoin remaining parts
      
      // Basic check if the time string actually looks like a time
      if (/[0-9]/.test(possibleTime)) {
        plannedTime = normalizeTime(possibleTime);
      } else {
        // Not a time, maybe the separator was just part of the sentence
        activity = raw;
      }
    }

    if (activity.trim()) {
      items.push({
        id: Math.random().toString(36).substring(7),
        activity: activity.trim(),
        plannedTime,
        status: "NEW", // Will be verified against DB later
      });
    }
  }

  return items;
}
