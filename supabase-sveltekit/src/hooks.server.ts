import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from "$env/static/public"
import { logIfError, type Database, type SupabaseClient } from "shared"
import { createContext } from "$lib/trpc/context"
import { router } from "$lib/trpc/router"
import { createServerClient } from "@supabase/ssr"
import type { Handle } from "@sveltejs/kit"
import { type Dict } from "@trpc/server"
import { resolveHTTPResponse } from "@trpc/server/http"

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.supabase = createServerClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      get: key => event.cookies.get(key),
      set: (key, value, options) => {
        // @ts-expect-error
        event.cookies.set(key, value, options)
      },
      remove: (key, options) => {
        // @ts-expect-error
        event.cookies.delete(key, options)
      },
    },
  }) as unknown as SupabaseClient

  event.locals.getSession = async () => {
    const {
      data: { session },
    } = await event.locals.supabase.auth.getSession().then(logIfError("getSession event locals"))
    return session
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  if (event.url.pathname.endsWith(".mjs") || event.url.pathname.endsWith(".js"))
    response.headers.set("Content-Type", "application/javascript")

  // console.log(event.request.headers.get("origin"))  e.g. chrome-extension://aomnlngcbnepejemfdjlllcmfhdppkio or localhost:5174
  const origin = event.request.headers.get("origin")
  // here if we want access control we can check origin programatically
  response.headers.set("Access-Control-Allow-Origin", origin || "*")
  response.headers.set("Access-Control-Allow-Credentials", "true")
  return response
}
