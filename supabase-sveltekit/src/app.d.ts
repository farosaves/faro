// src/app.d.ts

import { Session, type User } from "@supabase/supabase-js"
import { SupabaseClient } from "shared"
import "unplugin-icons/types/svelte"

declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient
      safeGetSession(): Promise<{ session: Session | null, user: User | null }>
    }
    // interface PageData {
    //   session: Session | null
    // }
    // interface Error {}
    // interface Platform { }
  }
}
