<script lang="ts">
  import { page } from "$app/stores"
  import { trpc } from "$lib/trpc-client.js"
  import type { Session } from "@supabase/gotrue-js"
  export let data
  import { onMount } from "svelte"
  import { API_ADDRESS, getSession, mock, type MockNote } from "$lib/utils"
  import { getSourceId, scratches, handlePayload } from "$lib/stores"
  import { NoteSync } from "$lib/shared/note-sync.js"
  import { get, type Readable } from "svelte/store"
  import NotePanel from "$lib/components/NotePanel.svelte"
  import { supa_update } from "./fun.js"
  import { domain_title } from "$lib/shared/utils.js"
  import { option } from "fp-ts"
  let login_url = API_ADDRESS + "/login"
  let curr_title = "Kalanchoe"
  let curr_url = ""
  let { supabase } = data
  let session: Session
  let note_sync: NoteSync = new NoteSync(supabase, undefined)
  let source_id: Readable<number>
  let curr_domain_title = ""
  $: T = trpc($page)

  let needToRefreshPage = false
  function getHighlight(source_id: number, tab_id: number) {
    needToRefreshPage = false
    chrome.tabs
      .sendMessage(tab_id, {
        action: "deserialize",
        uss: (get(note_sync.notestore)[source_id] || []).map((n) => [
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
    await note_sync.update_one_page($source_id)
    getHighlight($source_id, tab.id)
  }
  let logged_in = true
  let optimistic: option.Option<MockNote> = option.none
  setTimeout(() => {
    logged_in = !!session
    if (!logged_in) optimistic = option.none
  }, 1000)
  onMount(async () => {
    // supabase.auth.onAuthStateChange((event) => {
    //   if (event == "SIGNED_IN") logged_in = true;
    // }); this doesnt work... because client is different

    try {
      chrome.runtime.onMessage.addListener(
        async (request, sender, sendResponse) => {
          if (request.action == "update_curr_url") updateActive()
          if (request.action === "uploadTextSB") {
            const { note_data } = request as {
              action: string
              note_data: MockNote
            }
            if (note_data) {
              optimistic = option.some(note_data)
              note_sync.sem
                .use(supa_update(), supabase, note_data)
                .then((v) => v && T.note2card.mutate({ note_id: v.id }))
            }
          }
        },
      )
    } catch {
      console.log("dev?")
    }
    let { data } = await supabase.auth.getSession()
    let atokens = await T.my_email.query()
    if (!data.session) {
      console.log("getting session")
      atokens || window.open(login_url) // TODO: doesnt work iirc
      session = (await getSession(supabase, atokens))!
    } else {
      session = data.session
    }
    console.log("session is", session)
    note_sync.user_id = session.user.id
    logged_in = !!session
    await updateActive()
    note_sync.sub(handlePayload(note_sync)(curr_title, curr_url))
  })
</script>

{#if needToRefreshPage}
  <div role="alert" class="alert alert-error">
    <div class="flex flex-row">
      <!-- prettier-ignore -->
      <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      <span
        >If you just installed (or reloaded) the extension you need to refresh
        the page.</span>
    </div>
  </div>
{/if}

<!-- {$source_id} {session} -->
{#if !logged_in}
  <div role="alert" class="alert alert-error">
    <!-- prettier-ignore -->
    <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    <span
      >Not logged in! <a href={login_url} target="_blank">click here</a></span>
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
