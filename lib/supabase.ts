import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  typeof window !== "undefined" 
    ? (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "") 
    : "https://placeholder.supabase.co",
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "")
    : "placeholder-key-for-build"
);