import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | string | any) {
  const value = Number(amount);
  if (isNaN(value)) return "LKR 0";
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
  return `LKR ${formatted}`;
}

export function formatCurrencyCompact(amount: number | string | any) {
  const value = Number(amount);
  if (isNaN(value)) return "LKR 0";
  
  if (value >= 1000000) {
    return `LKR ${(value / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (value >= 1000) {
    return `LKR ${(value / 1000).toFixed(0)}K`;
  }
  return `LKR ${value}`;
}

/**
 * Shared utility to clean up list items (removes Markdown pipes, leading list numbers, etc.)
 * Preserves Sinhala and meaningful numbers.
 */
export function normalizeListItemText(rawText: string): string {
  let cleaned = rawText.trim();
  
  // 1. Remove Markdown table row artifacts: | 1 | Activity | 8:10 | -> 1 | Activity | 8:10
  cleaned = cleaned.replace(/^\|\s*/, "").replace(/\s*\|$/, "");
  
  // 2. Remove leading order numbers typically found in pasted lists
  // e.g. "1. ", "01. ", "1) ", "01) ", "1 | ", "1 - "
  cleaned = cleaned.replace(/^\d+\s*[\.\)|\-]\s+/, "");
  
  // 3. Remove bullet prefixes e.g., "-", "*", "•"
  cleaned = cleaned.replace(/^[-*•]\s*/, "");

  // 4. Replace remaining internal column separators ` | ` with ` - ` so standard parsers can split it
  cleaned = cleaned.replace(/\s+\|\s+/g, " - ");
  
  // 5. Collapse duplicate spaces
  cleaned = cleaned.replace(/\s{2,}/g, " ");

  return cleaned.trim();
}
