<script lang="ts">
  import { option as O } from "fp-ts"
  import { type Session } from "$lib/chromey/bg"
  import { RemoteStore } from "$lib/chromey/messages"
  import { Dashboard, sessStore } from "shared"
  import { getSyncLikeNStores } from "$lib/bgSync"
  import { createTRPCProxyClient } from "@trpc/client"
  import type { AppRouter } from "../background"
  import { chromeLink } from "trpc-chrome/link"
  const session = RemoteStore("session", O.none as O.Option<Session>)
  sessStore.set($session)
  const port = chrome.runtime.connect()
  export const TB = createTRPCProxyClient<AppRouter>({
    links: [chromeLink({ port })],
  })

  const noteSync = getSyncLikeNStores(TB)
</script>

<!-- <a href="dashboard" class="btn btn-primary">whao</a> -->
<!-- {JSON.stringify($session)} -->
<Dashboard {noteSync} />
