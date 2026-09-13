import { createClient } from "@supabase/supabase-js";

// Make sure these are set in your .env file
// NEXT_PUBLIC_SUPABASE_URL
// SUPABASE_SERVICE_ROLE_KEY (for server-side admin operations)

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-url.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";

// We use the service role key for backend operations so we can bypass RLS for uploads,
// since we authenticate via our own Next.js session system.
// Providing placeholders prevents module evaluation crashes (Error 500) if env vars are missing on Vercel.
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});
