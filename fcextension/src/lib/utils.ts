// import { createServerClient } from "@supabase/ssr";
// import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from "$env/static/public";
// export const url = "http://localhost:5173";

// export let getSupabase = async () =>
//   createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
//     cookies: {
//       get: (name) => chrome.cookies.get({ url, name }),
//       set: (key, value, options) => {
//         chrome.cookies.set(key, value, options);
//       },
//       remove: (key, options) => {
//         cookies.delete(key, options);
//       },
//     },
//   });

// /**
//  * a little helper that is written for convenience so that instead
//  * of calling `const { data: { session } } = await supabase.auth.getSession()`
//  * you just call this `await getSession()`
//  */
// export let getSession = async (supabase) => {
//   const {
//     data: { session },
//   } = await supabase.auth.getSession();
//   return session;
// };
