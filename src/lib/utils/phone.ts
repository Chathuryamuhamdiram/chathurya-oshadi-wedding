/**
 * Normalizes a phone number for use with WhatsApp deep links (wa.me)
 * Specifically handles Sri Lankan numbers to standard 947XXXXXXXX format.
 * 
 * @param phone Raw phone number string
 * @returns Normalized phone number for WhatsApp, or null if invalid/empty
 */
export function normalizeForWhatsApp(phone: string | null | undefined): string | null {
  if (!phone) return null;
  
  // Remove all non-numeric characters (e.g., spaces, +, -, etc)
  const cleanNum = phone.replace(/[^0-9]/g, '');
  
  if (!cleanNum) return null;

  // Handle Sri Lankan local format (e.g. 0712345678 -> 94712345678)
  const formattedNumber = cleanNum.startsWith('0') ? `94${cleanNum.slice(1)}` : cleanNum;
  
  // Basic validation (most valid numbers are at least 9-10 digits)
  if (formattedNumber.length >= 9) {
    return formattedNumber;
  }
  
  return null;
}
