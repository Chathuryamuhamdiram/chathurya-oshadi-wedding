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
