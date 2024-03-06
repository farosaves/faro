// src/app.d.ts

import { Session } from "@supabase/supabase-js";
import { SupabaseClient } from "shared";

declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient;
      getSession(): Promise<Session | null>;
    }
    interface PageData {
      session: Session | null;
    }
    // interface Error {}
    // interface Platform { }
  }
}
