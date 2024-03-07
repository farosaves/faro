// lib/trpc/client.ts
import { API_ADDRESS } from "./utils"
import type { Router } from "../../../supabase-sveltekit/src/lib/trpc/router"
import { httpBatchLink } from "@trpc/client"
import { createTRPCClient, type TRPCClientInit } from "trpc-sveltekit"

let browserClient: ReturnType<typeof createTRPCClient<Router>>

export function trpc(init?: TRPCClientInit) {
  const isBrowser = typeof window !== "undefined"
  if (isBrowser && browserClient) return browserClient
  const client = createTRPCClient<Router>({
    init, //@ts-ignore
    links: [
      httpBatchLink({
        url: API_ADDRESS + "/trpc", // this works even though warns,
      }),
    ],
  })
  if (isBrowser) browserClient = client
  return client
}
