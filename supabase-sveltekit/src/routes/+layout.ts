// export const ssr = false
export const prerender = true

import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from "$env/static/public"
import type { Database } from "shared"
import type { LayoutLoad } from "./$types"
import { createBrowserClient, isBrowser, parse } from "@supabase/ssr"
import type { SupabaseClient } from "shared"

export const load: LayoutLoad = async ({ fetch, data, depends }) => {
  depends("supabase:auth")
  const supabase = createBrowserClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
    global: {
      fetch,
    },
    cookies: {
      get(key) {
        if (!isBrowser()) {
          return JSON.stringify(data.session)
        }

        const cookie = parse(document.cookie)
        return cookie[key]
      },
    },
    auth: {
      autoRefreshToken: isBrowser(),
      detectSessionInUrl: isBrowser(),
    },
  }) as unknown as SupabaseClient
  return { supabase }
}
