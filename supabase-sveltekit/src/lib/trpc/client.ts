// lib/trpc/client.ts
import type { Router } from "$lib/trpc/router"
import type { TRPCLink } from "@trpc/client"
import { createTRPCClient, type TRPCClientInit } from "trpc-sveltekit"

let browserClient: ReturnType<typeof createTRPCClient<Router>>

export function trpc(init?: TRPCClientInit, links?: TRPCLink<Router>[] | undefined) {
  const isBrowser = typeof window !== "undefined"
  if (isBrowser && browserClient) return browserClient
  const client = createTRPCClient<Router>({
    init, // links,
  })
  if (isBrowser) browserClient = client
  return client
}
