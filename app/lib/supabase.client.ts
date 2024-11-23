import { createBrowserClient } from "@supabase/auth-helpers-remix";
import type { Database } from "./database.types";

export const createSupabaseClient = () =>
  createBrowserClient<Database>(
    window.env.SUPABASE_URL!,
    window.env.SUPABASE_ANON_KEY!
  );