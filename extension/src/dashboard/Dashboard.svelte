<script lang="ts">
  import { Dashboard } from "$lib"
  import { getSyncLikeNStores } from "$lib/bgSync"
  import { createTRPCProxyClient } from "@trpc/client"
  import type { AppRouter } from "../background"
  import { chromeLink } from "trpc-chrome/link"
  const port = chrome.runtime.connect()
  export const TB = createTRPCProxyClient<AppRouter>({
    links: [chromeLink({ port })],
  })

  const noteSync = getSyncLikeNStores(TB)
</script>

<Dashboard {noteSync} />
