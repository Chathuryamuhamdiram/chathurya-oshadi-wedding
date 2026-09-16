export interface ParsedFoodItem {
  id: string;
  name: string;
  isDuplicate?: boolean;
  duplicateAction?: 'SKIP' | 'ADD_NEW';
}

export function normalizeFoodName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

export function parseFoodMenuText(text: string): ParsedFoodItem[] {
  if (!text) return [];

  const lines = text.split(/\r?\n/);
  const items: ParsedFoodItem[] = [];

  for (const rawLine of lines) {
    let line = rawLine.trim();
    if (!line) continue;

    // Remove leading numbering (e.g., "1.", "1)", "12.", "12)")
    line = line.replace(/^\d+[\.\)]\s*/, "");
    
    // Remove leading bullets (e.g., "-", "•", "*")
    line = line.replace(/^[-•*]\s*/, "");
    
    // Trim again after removing prefixes
    line = line.trim();

    if (!line) continue;

    items.push({
      id: Math.random().toString(36).substring(2, 11),
      name: line
    });
  }

  return items;
}
