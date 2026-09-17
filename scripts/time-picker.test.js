const assert = require('assert');

// The logic we want to test for parsing manual text entry
function parseManualTime(input) {
  if (!input) return null;
  const normalized = input.trim().toUpperCase();
  // Regex to capture HH, mm, and optional AM/PM
  const match = normalized.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/);
  
  if (!match) return null;
  
  let h = parseInt(match[1], 10);
  let m = match[2] ? parseInt(match[2], 10) : 0;
  const ampm = match[3];

  if (isNaN(h) || isNaN(m)) return null;
  if (m < 0 || m > 59) return null;
  
  // if AM/PM is provided, hour must be 1-12
  if (ampm) {
    if (h < 1 || h > 12) return null;
    if (ampm === "PM" && h !== 12) h += 12;
    if (ampm === "AM" && h === 12) h = 0;
  } else {
    // 24h format input
    if (h < 0 || h > 23) return null;
  }

  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

// Convert 24h "HH:mm" to 12h display
function formatDisplayValue(time24) {
  if (!time24) return "";
  const [h, m] = time24.split(":");
  let hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  const hourStr = hour.toString().padStart(2, "0");
  return `${hourStr}:${m} ${ampm}`;
}


// --- TESTS ---
try {
  // Parsing AM/PM
  assert.strictEqual(parseManualTime("8:50 AM"), "08:50");
  assert.strictEqual(parseManualTime("12:00 AM"), "00:00");
  assert.strictEqual(parseManualTime("12:00 PM"), "12:00");
  assert.strictEqual(parseManualTime("6:30 PM"), "18:30");
  assert.strictEqual(parseManualTime("01:15 AM"), "01:15");
  
  // Parsing without AM/PM (24h)
  assert.strictEqual(parseManualTime("08:50"), "08:50");
  assert.strictEqual(parseManualTime("18:00"), "18:00");
  assert.strictEqual(parseManualTime("10:30"), "10:30");
  assert.strictEqual(parseManualTime("00:00"), "00:00");

  // Invalid times
  assert.strictEqual(parseManualTime("25:00"), null);
  assert.strictEqual(parseManualTime("13:00 AM"), null);
  assert.strictEqual(parseManualTime("10:60"), null);
  assert.strictEqual(parseManualTime("invalid"), null);

  // Formatting 12h display
  assert.strictEqual(formatDisplayValue("08:50"), "08:50 AM");
  assert.strictEqual(formatDisplayValue("00:00"), "12:00 AM");
  assert.strictEqual(formatDisplayValue("12:00"), "12:00 PM");
  assert.strictEqual(formatDisplayValue("18:30"), "06:30 PM");

  console.log("✅ All parsing tests passed!");
} catch (e) {
  console.error("❌ Test failed:", e.message);
  process.exit(1);
}
