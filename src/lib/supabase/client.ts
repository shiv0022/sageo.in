import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { logger } from "@/lib/logging/logger";

let supabase: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (supabase) return supabase;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    logger.warn("Supabase credentials missing. Supabase operations will fail or fall back.");
    return null;
  }

  try {
    supabase = createClient(url, anonKey);
    logger.info("Supabase client initialized successfully.");
    return supabase;
  } catch (error) {
    logger.error("Failed to initialize Supabase client.", error);
    return null;
  }
}
