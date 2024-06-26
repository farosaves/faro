<script lang="ts">
  import IconRefresh from "~icons/tabler/refresh"
  import IconCog from "~icons/jam/cog"
  import IconLayoutDashboard from "~icons/tabler/layout-dashboard"

  import type { Session } from "@supabase/gotrue-js"
  import { onMount } from "svelte"
  import type { PendingNote, Src } from "shared"
  import {
    CmModal,
    API_ADDRESS,
    updateTheme,
    toastStore,
    funLog,
    windowActive,
    toastNotify,
    altKey,
  } from "shared"
  import { shortcut } from "shared"
  import NotePanel from "$lib/components/NotePanel.svelte"
  import { option as O } from "fp-ts"
  import { createTRPCProxyClient } from "@trpc/client"
  import type { AppRouter } from "./background"
  import { chromeLink } from "trpc-chrome/link"
  import { optimisticNotes, RemoteStore } from "$lib/chromey/messages"
  import { getBgSync } from "$lib/bgSync"
  let login_url = API_ADDRESS + "/account/login"
  // $: T = trpc2()
  const port = chrome.runtime.connect()
  export const TB = createTRPCProxyClient<AppRouter>({
    links: [chromeLink({ port })],
  })

  const bgSync = getBgSync(TB)
  const currSrcs = RemoteStore("currSrcs", new Map<number, Src>())
  const windowId = writable(-1)
  const currSrc = derived([currSrcs, windowId], ([srcs, id]) => srcs.get(id) || { title: "", domain: "" })
  const needsRefresh = RemoteStore("needsRefresh", false)
  const session = RemoteStore("session", O.none as O.Option<Session>)
  const email = derived(session, (s) => O.toNullable(s)?.user?.email)

  let optimistic: O.Option<PendingNote> = O.none
  import { themeChange } from "theme-change"
  import { fade } from "svelte/transition"
  import { derived, writable } from "svelte/store"
  import { hasOrGivesPerm } from "$lib/utils"

  const dashboardURL = chrome.runtime.getURL("dashboard.html")
  onMount(async () => {
    const window = await chrome.windows.getCurrent()
    windowId.set(window.id || NaN)
    funLog("windowid")(window.id)
    optimisticNotes.stream.subscribe(([x]) => {
      optimistic = O.some(x)
      setTimeout(() => (optimistic = O.none), 2000)
    })
    TB.refresh.query()
    themeChange(false)
  })

  const handle_keydown = (e: KeyboardEvent) => {
    if (e.metaKey && e.key === "z") {
      e.preventDefault()
      ;(e.shiftKey ? TB.redo.query : TB.undo.query)()
    }
  }
  const iconSize = 15
  const themes = ["default", "light", "dark", "retro", "cyberpunk", "aqua"]
  const perm = { permissions: ["bookmarks"] }
</script>

<svelte:window
  on:keydown={handle_keydown}
  on:focus={() => ($windowActive = true)}
  on:blur={() => ($windowActive = false)} />

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
        href={$email ? `${API_ADDRESS}/dashboard` : dashboardURL}
        target="_blank"
        class="tooltip tooltip-left"
        data-tip="Go to dashboard ({altKey}+C)"
        use:shortcut={{ alt: true, code: "KeyC" }}
        ><IconLayoutDashboard transform="rotate(90)" font-size={iconSize} /></a>

      <button
        class="tooltip tooltip-left"
        data-tip={"Logged in as: \n" + ($email || "...not logged in")}
        on:click={() => TB.refresh.query()}
        on:contextmenu|preventDefault={() => TB.disconnect.query()}>
        <!-- on:dblclick={() => setTimeout(TB.disconnect.query, 1000)} -->
        <IconRefresh font-size={iconSize} />
      </button>
      <!-- <div class="dropdown dropdown-end">
        <div tabindex="0" role="button"><IconCog font-size={iconSize} /></div>
        <div class="dropdown-content join join-vertical z-20">
          {#each themes as value}
            <button
              class="btn join-item z-20"
              data-set-theme={value}
              data-act-class="ACTIVECLASS"
              on:click={() => setTimeout(updateTheme, 100)}
              >{value.replace(/\b\w/g, (s) => s.toUpperCase())}</button>
          {/each}
        </div>
      </div> -->
      <!-- so far copied 1-1 -->
      <div class="dropdown dropdown-end">
        <div tabindex="0" role="button"><IconCog font-size={iconSize} /></div>
        <div class="dropdown-content menu z-20 bg-base-200">
          <li>
            <button
              class="btn z-20"
              on:click={async () => {
                if (!(await hasOrGivesPerm(perm))) return //rejected
                TB.syncBookmarks.query()
                toastNotify("Exported to Other Bookmarks/Faros Bookmarks", 5000)
              }}>Sync with bookmarks</button>
          </li>
          <li>
            <details>
              <summary>Theme</summary>
              <ul class="join join-vertical">
                {#each themes as value}
                  <li>
                    <button
                      class="btn join-item z-20 btn-sm"
                      data-set-theme={value}
                      data-act-class="ACTIVECLASS"
                      on:click={() => setTimeout(updateTheme, 100)}
                      >{value.replace(/\b\w/g, (s) => s.toUpperCase())}</button>
                  </li>
                {/each}
              </ul>
            </details>
          </li>
          <li>
            <button
              class="btn z-20 text-error"
              on:click={async () => {
                await TB.hardReset.query()
                toastNotify("Local data deleted", 5000)
              }}>Delete local data</button>
          </li>
        </div>
      </div>
    </div>
  </div>

  <NotePanel bind:optimistic syncLike={bgSync} {windowId} />

  <CmModal />

  <div class="toast">
    {#each $toastStore as [toastMsg, n] (n)}
      <div out:fade class="alert alert-info">
        <span>{toastMsg}</span>
      </div>
    {/each}
  </div>

  <!-- <textarea
    placeholder="scratchy scratch scratch"
    class="max-w-xs w-full bottom-0 left-0 absolute textarea p-1"
    bind:value={$scratches[$currDomainTitle]} /> -->
</div>
