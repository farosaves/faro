<script lang="ts">
  import IconRefresh from "~icons/tabler/refresh"

  import { trpc2 } from "$lib/trpc-client"
  import type { Session } from "@supabase/gotrue-js"
  import { onMount } from "svelte"
  import { API_ADDRESS, getSession } from "$lib/utils"
  import type { PendingNote } from "shared"
  import { scratches } from "$lib/stores"
  import { NoteSync, domain_title, shortcut } from "shared"
  import NotePanel from "$lib/components/NotePanel.svelte"
  import { option as O, record as R } from "fp-ts"
  import { createTRPCProxyClient } from "@trpc/client"
  import type { AppRouter } from "./background"
  import { chromeLink } from "trpc-chrome/link"
  import { optimisticNotes, RemoteStore } from "$lib/chromey/messages"
  import { getBgSync } from "$lib/bgSync"
  import { derived, get } from "svelte/store"
  let login_url = API_ADDRESS + "/login"
  $: T = trpc2()
  const port = chrome.runtime.connect()
  export const TB = createTRPCProxyClient<AppRouter>({
    links: [chromeLink({ port })],
  })

  const bgSync = getBgSync(TB)
  const currSrc = RemoteStore("currSrc", { title: "", url: "" })
  const currDomainTitle = derived(currSrc, ({ title, url }) =>
    O.getOrElse(() => "")(domain_title(url, title)),
  )
  const needsRefresh = RemoteStore("needsRefresh", false)
  const session = RemoteStore("session", O.none as O.Option<Session>)

  let logged_in = true
  let optimistic: O.Option<PendingNote> = O.none
  setTimeout(() => {
    logged_in = O.isSome(get(session))
  }, 1000)

  const dashboardURL = chrome.runtime.getURL("dashboard.html")
  onMount(async () => {
    console.log("dashboardURL", dashboardURL)
    optimisticNotes.stream.subscribe(([x]) => {
      optimistic = O.some(x)
      setTimeout(() => (optimistic = O.none), 1000)
    })
    TB.refresh.query().then(console.log)
  })

  const handle_keydown = (e: KeyboardEvent) => {
    if (e.metaKey && e.key === "z") {
      e.preventDefault()
      ;(e.shiftKey ? TB.redo.query : TB.undo.query)()
    }
  }
</script>

<svelte:window on:keydown={handle_keydown} />

<a href={`${API_ADDRESS}/dashboard?search`} target="_blank" use:shortcut={{ alt: true, code: "KeyF" }}
  >go to dashboard / alfF</a>
<button
  class="tooltip tooltip-bottom"
  data-tip={"logged in as: \n" + (O.toNullable($session)?.user?.email || "...not logged in")}
  on:click={() => TB.refresh.query().then(console.log)}>
  <IconRefresh />
</button>
<a target="_blank" href={dashboardURL}>welcome?</a>

{#if $needsRefresh}
  <div role="alert" class="alert alert-error">
    <div class="flex flex-row">
      <!-- prettier-ignore -->
      <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      <span>If you just installed (or reloaded) the extension you need to refresh the page.</span>
    </div>
  </div>
{/if}

<!-- {$source_id} {session} -->
{#if !logged_in}
  <div role="alert" class="alert alert-error">
    <!-- prettier-ignore -->
    <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    <span>Not logged in! <a href={login_url} target="_blank">click here</a></span>
  </div>
{/if}

<div class="max-w-xs mx-auto space-y-4">
  <div class=" text-xl text-center w-full italic">{$currSrc.title}</div>
  <NotePanel bind:optimistic syncLike={bgSync} />
  <!-- {JSON.stringify($currSrc)}{$currDomainTitle} -->
  <textarea
    placeholder="scratchy scratch scratch"
    class="max-w-xs w-full bottom-0 left-0 absolute textarea p-1"
    bind:value={$scratches[$currDomainTitle]} />
</div>
