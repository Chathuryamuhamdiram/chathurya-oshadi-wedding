export function formatLKR(amount: number | string | any): string {
  const value = Number(amount);
  if (isNaN(value)) return "LKR 0.00";
  return `LKR ${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function parseMoneyAmount(val: string): number | null {
  if (!val) return null;
  // Remove non-numeric characters except decimal point
  const clean = val.replace(/[^0-9.]/g, "");
  const num = parseFloat(clean);
  return isNaN(num) || num <= 0 ? null : num;
}
