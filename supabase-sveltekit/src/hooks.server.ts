import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from "$env/static/public"
import { type Database, type SupabaseClient } from "shared"
import { createContext } from "$lib/trpc/context"
import { router } from "$lib/trpc/router"
import { createServerClient } from "@supabase/ssr"
import type { Handle } from "@sveltejs/kit"
import { type Dict } from "@trpc/server"
import { resolveHTTPResponse } from "@trpc/server/http"
import { either as E } from "fp-ts"
import { pipe } from "fp-ts/lib/function"

export const handle: Handle = async ({ event, resolve }) => {
  // event.setHeaders({ "Cache-Control": "no-store" }) // https://github.com/sveltejs/kit/issues/6735#issuecomment-1248053008 - makes it worse lol

  const failedSets: [string, string][] = []
  const failedRemoves: string[] = []

  event.locals.supabase = createServerClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      get: key => event.cookies.get(key),
      set: (key, value, options) => {
        pipe(
          () => event.cookies.set(key, value, { ...options, path: "/" }),
          x => E.tryCatch(x, () => failedSets.push([key, value])))
      },
      remove: (key, options) => {
        pipe(
          () => event.cookies.delete(key, { ...options, path: "/" }),
          x => E.tryCatch(x, () => failedRemoves.push(key)))
        // O.tryCatch, O.getOrElseW(() => funLog("cookie set")("failed")))
      },
    },
    auth: {
      autoRefreshToken: false,
      // detectSessionInUrl: false,
    },
  }) as unknown as SupabaseClient

  event.locals.safeGetSession = async () => {
    const { data: { session } } = await event.locals.supabase.auth.getSession()
    if (!session) {
      return { session: null, user: null }
    }
    const {
      data: { user },
      error,
    } = await event.locals.supabase.auth.getUser()
    if (error) {
      // JWT validation has failed
      return { session: null, user: null }
    }
    // await sleep(100) // ! what does this do?
    return { session, user }
  }

  let response
  const trpc_url = "/trpc"
  if (event.request.method === "OPTIONS") response = new Response(JSON.stringify({}), { status: 200 })
  else if (event.url.pathname.startsWith(trpc_url + "/")) {
    const request = event.request as Request & {
      headers: Dict<string | string[]>
    }

    const req = {
      method: request.method,
      headers: request.headers,
      query: event.url.searchParams,
      body: await request.text(),
    }

    const httpResponse = await resolveHTTPResponse({
      router,
      req,
      path: event.url.pathname.substring(trpc_url.length + 1),
      createContext: async () => createContext?.(event),
      onError: ({ type, path, error }) =>
        console.error(`Encountered error while trying to process ${type} @ ${path}:`, error),
    })

    const { status, headers, body } = httpResponse as {
      status: number
      headers: Record<string, string>
      body: string
    }

    response = new Response(body, { status, headers })
  } else // DEFAULT
    response = await resolve(event, {
      filterSerializedResponseHeaders(name) {
        return name === "content-range"
      },
    })

  // console.log(response.headers)

  // response.headers.getSetCookie({
  //   name: "sb-{YOUR_ID}-auth-token",
  //   value: JSON.stringify(session),
  //   path: "/",
  // })


  if (event.url.pathname.endsWith(".mjs") || event.url.pathname.endsWith(".js"))
    response.headers.set("Content-Type", "application/javascript")

  // response.headers.set("Set-Cookie", xx)


  const origin = event.request.headers.get("origin")
  // console.log(event.request.headers.get("origin"))  e.g. chrome-extension://aomnlngcbnepejemfdjlllcmfhdppkio or localhost:5174
  // here if we want access control we can check origin programatically

  response.headers.set("Access-Control-Allow-Origin", origin || "*")
  response.headers.set("Access-Control-Allow-Credentials", "true")
  return response
}
