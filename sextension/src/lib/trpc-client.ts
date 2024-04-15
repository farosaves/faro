// lib/trpc/client.ts
import { API_ADDRESS } from "shared"
import type { Router } from "../../../supabase-sveltekit/src/lib/trpc/router"
import { httpBatchLink, createTRPCProxyClient } from "@trpc/client"
// import { createTRPCClient, type TRPCClientInit } from "trpc-sveltekit"

// let browserClient: ReturnType<typeof createTRPCClient<Router>>

export function trpc2() {
  return createTRPCProxyClient<Router>({
    links: [
      httpBatchLink({
        url: API_ADDRESS + "/trpc", // this works even though warns,
      }),
    ],
  })
}
