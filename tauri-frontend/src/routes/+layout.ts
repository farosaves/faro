import { createBrowserClient, isBrowser, parse } from "@supabase/ssr"
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from "$env/static/public"
import type { LayoutLoad } from "./$types"
import type { Database, SupabaseClient } from "shared"

// Tauri doesn't have a Node.js server to do proper SSR
// so we will use adapter-static to prerender the app (SSG)
// See: https://v2.tauri.app/start/frontend/sveltekit/ for more info
export const prerender = true
export const ssr = false

export const load: LayoutLoad = async ({ fetch, data, depends }) => {
  depends("supabase:auth")

  const supabase = createBrowserClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
    global: {
      fetch,
    },
    cookies: {
      get(key) {
        // if (!isBrowser()) {
        //   return JSON.stringify(data?.session)
        // }

        const cookie = parse(document.cookie)
        return cookie[key]
      },
    },
    auth: {
      autoRefreshToken: isBrowser(),
      detectSessionInUrl: isBrowser(),
    },
  }) as unknown as SupabaseClient

  const safeGetSession = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return { session: null, user: null }
    }
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()
    if (error) {
      // JWT validation has failed
      return { session: null, user: null }
    }
    return { session, user }
  }

  const { session, user } = await safeGetSession()

  return {
    supabase,
    session,
    user,
  }
}
