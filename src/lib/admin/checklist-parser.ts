export interface ParsedChecklistItem {
  id: string;
  name: string;
  quantity: string;
  isDuplicate?: boolean;
  existingId?: string;
  originalName?: string; // used for preview
}

/**
 * Normalizes text for duplicate matching
 */
export function normalizeItemName(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, ' ') // collapse spaces
    .replace(/\s*[-–—]\s*/g, '-') // normalize dashes
    .toLowerCase();
}

/**
 * Parses raw pasted text into checklist items
 */
export function parseChecklistText(rawText: string): ParsedChecklistItem[] {
  const lines = rawText.split(/\r?\n/);
  const items: ParsedChecklistItem[] = [];

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    // Remove leading list numbering (e.g. "1. ", "10. ", "27. ")
    line = line.replace(/^\d+\.\s*/, '');

    // Look for explicit dash separators: -, –, —
    const dashMatch = line.match(/^(.*?)\s*[-–—]\s*(.*)$/);
    
    if (dashMatch) {
      // It has a clear quantity part
      const namePart = dashMatch[1].trim();
      const quantityPart = dashMatch[2].trim();
      
      items.push({
        id: crypto.randomUUID(),
        name: namePart,
        quantity: quantityPart
      });
      continue;
    }

    // No dash separator. Check for '/' splits.
    // We only split by '/' if it has spaces around it OR if it's not a fraction.
    // Split by ` / ` (with spaces) covers cases like "දෙවන දින ඇඳුම් / මුදු 02 / කර මාලය"
    let splitParts = line.split(/\s+\/\s+/);
    
    // If no " / " found, let's try just `/` but ensure we don't split fractions.
    if (splitParts.length === 1 && line.includes('/')) {
      // Split by `/` that doesn't have a digit immediately before AND after it
      // Javascript regex engine supports lookbehinds in V8
      const regex = /(?<!\d)\/(?!\d)/;
      if (regex.test(line)) {
        splitParts = line.split(regex);
      }
    }

    for (let part of splitParts) {
      part = part.trim();
      if (!part) continue;

      // Extract trailing quantity if present
      // Matches things like "මුදු 02", "නෙළුම් මල් (රතු) 10"
      // But we shouldn't strip dimensions like "(අඩි 1.5 × 3)"
      const trailingQuantityRegex = /(.*?)\s+(\d{1,3}(?:\.\d+)?\s*(?:kg|g|m|pcs|)?)$/i;
      const tqMatch = part.match(trailingQuantityRegex);

      if (tqMatch) {
        const namePart = tqMatch[1].trim();
        const quantityPart = tqMatch[2].trim();
        
        // Ensure namePart isn't empty and doesn't end with a dimension bracket
        if (namePart.length > 0 && !namePart.endsWith(')')) {
           items.push({
             id: crypto.randomUUID(),
             name: namePart,
             quantity: quantityPart
           });
           continue;
        }
      }

      // No trailing quantity detected (or it was part of a bracket)
      items.push({
        id: crypto.randomUUID(),
        name: part,
        quantity: ""
      });
    }
  }

  return items;
}
