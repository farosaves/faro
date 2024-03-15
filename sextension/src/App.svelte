<script lang="ts">
  // import { page } from "$app/stores"
  import { trpc2 } from "$lib/trpc-client"
  import type { Session } from "@supabase/gotrue-js"
  import { onMount } from "svelte"
  import { API_ADDRESS, getSession, type MockNote } from "$lib/utils"
  import { getSourceId, scratches } from "$lib/stores"
  import { NoteSync, domain_title, shortcut } from "shared"
  import { get, type Readable } from "svelte/store"
  import NotePanel from "$lib/components/NotePanel.svelte"
  import { option as O, record as R } from "fp-ts"
  import { loadSB } from "$lib/loadSB"
  import { NoteMut } from "$lib/note_mut"
  let login_url = API_ADDRESS + "/login"
  let curr_title = "Kalanchoe"
  let curr_url = ""
  const loadResult = loadSB()
  const { supabase } = loadResult
  let session: Session
  let note_sync: NoteSync = new NoteSync(supabase, undefined)
  const note_mut: NoteMut = new NoteMut(note_sync)
  let source_id: Readable<number>
  let curr_domain_title = ""
  $: T = trpc2()
  let needToRefreshPage = false
  function getHighlight(source_id: number, tab_id: number) {
    needToRefreshPage = false
    chrome.tabs
      .sendMessage(tab_id, {
        action: "deserialize",
        uss: R.toArray(get(note_sync.notestore) || []).map(([k, n]) => [
          n.snippet_uuid,
          n.serialized_highlight,
        ]),
      })
      .catch((e) => {
        needToRefreshPage = true
      })
  }

  async function updateActive() {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!tab.url || !tab.title || !tab.id) return
    curr_title = tab.title
    curr_url = tab.url
    curr_domain_title = domain_title(tab.url, curr_title)
    if (!(curr_domain_title in $scratches))
      scratches.update((t) => {
        t[curr_domain_title] = ""
        return t
      })
    source_id = await getSourceId(supabase)(curr_url, curr_title)
    await note_sync.refresh_notes(O.some($source_id))
    getHighlight($source_id, tab.id)
  }
  let logged_in = true
  let optimistic: O.Option<MockNote> = O.none
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
    try {
      chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
        if (request.action == "update_curr_url") updateActive()
        if (request.action == "content_script_loaded" && needToRefreshPage) updateActive()
        if (request.action === "uploadTextSB") {
          const { note_data } = request as {
            action: string
            note_data: MockNote
          }
          console.log("got data", note_data)
          if (note_data) {
            optimistic = O.some(note_data)
            note_mut.addNote(note_data, { title: curr_title, url: curr_url })
            // supa_update()(supabase, note_data).then((v) => v && T.note2card.mutate({ note_id: v.id }))
            setTimeout(() => (optimistic = O.none), 1000)
            // TODO: if you add two within 1 second it will mess it up
          }
        }
      })
    } catch {
      console.log("dev?")
    }
    const _session = await getSessionTok()
    if (_session) session = _session
    console.log("session is", session)
    note_sync.user_id = session.user.id
    logged_in = !!session
    await updateActive()
    note_sync.sub()
    console.log(get(note_sync.notestore))
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
  <div class=" text-xl text-center w-full italic">{curr_title}</div>
  <NotePanel bind:optimistic {note_sync} source_id={$source_id} />

  <textarea
    placeholder="scratchy scratch scratch"
    class="w-full"
    bind:value={$scratches[curr_domain_title]} />
  <!-- <button on:click={() => console.log(peccatoribus(2.5))}> pls</button> -->
</div>
