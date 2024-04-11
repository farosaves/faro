<script lang="ts">
  import IconRefresh from "~icons/tabler/refresh"
  import IconLayoutDashboard from "~icons/tabler/layout-dashboard"

  import { trpc2 } from "$lib/trpc-client"
  import type { Session } from "@supabase/gotrue-js"
  import { onMount } from "svelte"
  import { type PendingNote, CmModal, API_ADDRESS } from "shared"
  import { domain_title, shortcut } from "shared"
  import NotePanel from "$lib/components/NotePanel.svelte"
  import { option as O } from "fp-ts"
  import { createTRPCProxyClient } from "@trpc/client"
  import type { AppRouter } from "./background"
  import { chromeLink } from "trpc-chrome/link"
  import { optimisticNotes, RemoteStore } from "$lib/chromey/messages"
  import { getBgSync } from "$lib/bgSync"
  import { derived } from "svelte/store"
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

  let optimistic: O.Option<PendingNote> = O.none
  // let logged_in = true
  // setTimeout(() => {
  //   logged_in = O.isSome(get(session))
  // }, 1000)

  const dashboardURL = chrome.runtime.getURL("dashboard.html")
  onMount(async () => {
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
  const iconSize = 15
</script>

<svelte:window on:keydown={handle_keydown} />

<!-- <a target="_blank" href={dashboardURL}>welcome?</a> -->

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
{#if O.isNone($session)}
  <div role="alert" class="alert alert-warning grid-flow-col justify-items-start text-start p-1">
    <!-- prettier-ignore -->
    <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
    <span>Not logged in! <a href={login_url} target="_blank" class="underline">link</a></span>
  </div>
{/if}

<div class="max-w-xs mx-auto space-y-4">
  <div class="flex">
    <div class=" text-xl text-center w-full italic">{$currSrc.title}</div>

    <div class="grid h-min">
      <a
        href={O.isNone($session) ? dashboardURL : `${API_ADDRESS}/dashboard`}
        target="_blank"
        class="tooltip tooltip-left"
        data-tip="Go to dashboard (alt+F)"
        use:shortcut={{ alt: true, code: "KeyF" }}
        ><IconLayoutDashboard transform="rotate(90)" font-size={iconSize} /></a>

      <button
        class="tooltip tooltip-left"
        data-tip={"Logged in as: \n" + (O.toNullable($session)?.user?.email || "...not logged in")}
        on:click={() => TB.refresh.query().then(console.log)}
        on:contextmenu|preventDefault={() => TB.disconnect.query()}>
        <IconRefresh font-size={iconSize} />
      </button>
    </div>
  </div>

  <NotePanel bind:optimistic syncLike={bgSync} />

  <CmModal />
  <!-- <textarea
    placeholder="scratchy scratch scratch"
    class="max-w-xs w-full bottom-0 left-0 absolute textarea p-1"
    bind:value={$scratches[$currDomainTitle]} /> -->
</div>
