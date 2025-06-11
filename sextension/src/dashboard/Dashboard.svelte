<script lang="ts">
  import { Dashboard } from "shared"
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

<!-- <a href="dashboard" class="btn btn-primary">whao</a> -->
<!-- {JSON.stringify($session)} -->
<Dashboard {noteSync} isInExt />
