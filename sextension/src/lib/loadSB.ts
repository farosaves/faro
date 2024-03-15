const { VITE_SUPABASE_ANON_KEY, VITE_SUPABASE_URL } = import.meta.env

import { createBrowserClient, isBrowser, parse } from "@supabase/ssr"
import type { Database } from "shared"
export const loadSB = () => {
  const supabase = createBrowserClient<Database>(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, {
    global: {
      fetch,
    },
    cookies: {
      async get(name) {
        if (!isBrowser()) {
          return // (await chrome.cookies.get({url, name})).value
        }

        const cookie = parse(document.cookie)
        return cookie[name]
      },
    },
  })

  const session = supabase.auth.getSession().then((d) => d.data.session)
  return { supabase, session }
}
