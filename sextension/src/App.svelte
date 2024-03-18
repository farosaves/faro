<script lang="ts">
  // import { page } from "$app/stores"
  import { trpc2 } from "$lib/trpc-client"
  import type { Session } from "@supabase/gotrue-js"
  import { onMount } from "svelte"
  import { API_ADDRESS, getSession } from "$lib/utils"
  import type { PendingNote } from "shared"
  import { scratches } from "$lib/stores"
  import { NoteSync, domain_title, shortcut } from "shared"
  import { get, type Readable } from "svelte/store"
  import NotePanel from "$lib/components/NotePanel.svelte"
  import { option as O, record as R } from "fp-ts"
  import { loadSB } from "$lib/loadSB"
  import { NoteMut } from "$lib/note_mut"
  import { createTRPCProxyClient } from "@trpc/client"
  import type { AppRouter } from "./background"
  import { chromeLink } from "trpc-chrome/link"
  import { pendingNotes, RemoteStore } from "$lib/chromey/messages"
  let login_url = API_ADDRESS + "/login"
  let title = "Kalanchoe"
  let url = ""
  const loadResult = loadSB()
  const { supabase } = loadResult
  let session: Session
  let note_sync: NoteSync = new NoteSync(supabase, undefined)
  const note_mut: NoteMut = new NoteMut(note_sync)
  let curr_domain_title = ""
  $: T = trpc2()
  const port = chrome.runtime.connect()
  export const TB = createTRPCProxyClient<AppRouter>({
    links: [/* 👉 */ chromeLink({ port })],
  })

  let needToRefreshPage = false
  function getHighlight(source_id: string, tab_id: number) {
    needToRefreshPage = false
    chrome.tabs
      .sendMessage(tab_id, {
        action: "deserialize",
        uss: get(note_mut.panel).map((n) => [n.snippet_uuid, n.serialized_highlight]),
      })
      .catch((e) => {
        needToRefreshPage = true
      })
  }
  const currUrl = RemoteStore("currUrl", "pending url")

  async function updateActive() {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!tab.url || !tab.title || !tab.id) return
    ;({ url, title } = tab)

    curr_domain_title = O.getOrElse(() => "")(domain_title(url, title))
    if (!(curr_domain_title in $scratches))
      scratches.update((t) => {
        t[curr_domain_title] = ""
        return t
      })

    let source_id = note_mut.localSrcId({ url, title })
    if (!O.isSome(source_id)) {
      await note_sync.refresh_sources()
      source_id = note_mut.localSrcId({ url, title })
    }
    await note_sync.refresh_notes(source_id)

    getHighlight(O.getOrElse(() => "")(source_id), tab.id)
  }
  let logged_in = true
  let optimistic: O.Option<PendingNote> = O.none
  setTimeout(() => {
    logged_in = !!session
    // if (!logged_in) optimistic = O.none
  }, 1000)
  const getSessionTok = async () => {
    let atokens = await T.my_email.query()
    const session = await getSession(supabase, atokens)
    if (session) return session
    const { data } = await supabase.auth.getSession()
    if (data.session) return data.session
    console.log("no session!")
    window.open(login_url) // irc doesnt work
    return null
  }

  onMount(async () => {
    pendingNotes.stream.subscribe(([x, { tab }]) => {
      console.log("note data directly", tab?.id, x)
    })
    const _session = await getSessionTok()
    if (_session) session = _session
    console.log("session is", session)
    note_sync.setUid(session.user.id)
    // note_sync.refresh_sources()
    // note_sync.refresh_notes()
    logged_in = !!session
    await updateActive()
    note_sync.sub()
    console.log(get(note_sync.notestore))

    try {
      chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
        if (request.action == "update_curr_url") updateActive()
        if (request.action == "content_script_loaded" && needToRefreshPage) updateActive()
        if (request.action === "uploadTextSB") {
          const { note_data } = request as {
            action: string
            note_data: PendingNote
          }
          console.log("got data", note_data)
          if (note_data) {
            optimistic = O.some(note_data)
            note_mut.addNote(note_data, { title, url })
            // supa_update()(supabase, note_data).then((v) => v && T.note2card.mutate({ note_id: v.id }))
            setTimeout(() => (optimistic = O.none), 1000)
          }
        }
      })
    } catch {
      console.log("dev?")
    }
  })

  const handle_keydown = (e: KeyboardEvent) => {
    if (e.metaKey && e.key === "z") {
      e.preventDefault()
      note_sync.restoredelete()
      // (e.shiftKey ? redo : undo)();
    }
  }
</script>

<svelte:window on:keydown={handle_keydown} />

<a href={`${API_ADDRESS}/dashboard`} target="_blank" use:shortcut={{ alt: true, code: "KeyF" }}
  >go to dashboard - rly i should have command for it..</a>

{$currUrl}

{#if needToRefreshPage}
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
  <div class=" text-xl text-center w-full italic">{title}</div>
  <NotePanel bind:optimistic {note_sync} {note_mut} />

  <textarea
    placeholder="scratchy scratch scratch"
    class="w-full"
    bind:value={$scratches[curr_domain_title]} />
  <!-- <button on:click={() => console.log(peccatoribus(2.5))}> pls</button> -->
</div>
