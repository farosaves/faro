// export const prerender = false;
// handle the session and the supabase object on the client-side.

// import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
// import { createSupabaseLoadClient } from '@supabase/auth-helpers-sveltekit';

// export const load = async ({ fetch, data, depends }) => {
// 	depends('supabase:auth');

// 	const supabase = createSupabaseLoadClient({
// 		supabaseUrl: PUBLIC_SUPABASE_URL,
// 		supabaseKey: PUBLIC_SUPABASE_ANON_KEY,
// 		event: { fetch },
// 		serverSession: data.session
// 	});

// 	const {
// 		data: { session }
// 	} = await supabase.auth.getSession();

// 	return { supabase, session };
// };

import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public'
import type { Database } from '$lib/dbtypes'
import type { LayoutLoad } from './$types'
import { createBrowserClient, isBrowser, parse } from '@supabase/ssr'

export const load: LayoutLoad = async ({ fetch, data, depends }) => {
  depends('supabase:auth')
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
  })
  // if (isBrowser()) {console.log(document.cookie);}

  const {
    data: { session },
  } = await supabase.auth.getSession()
  // console.log(session)
  return { supabase, session }
}