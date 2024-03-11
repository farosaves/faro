<script lang="ts">
  import { onMount } from "svelte"
  import Note from "$lib/components/Note.svelte"
  import { NoteSync, getTitlesUrls } from "shared"
  import Search from "$lib/components/Search.svelte"
  import type { NoteEx } from "shared"
  import DomainFilter from "$lib/components/DomainFilter.svelte"
  import { identity, flow, pipe } from "fp-ts/lib/function"
  import { redirect } from "@sveltejs/kit"
  import LoginPrompt from "$lib/components/LoginPrompt.svelte"
  import { option as O } from "fp-ts"
  import { handlePayload, type NoteFilter } from "$lib/utils"
  import { sessStore } from "shared"
  import TagView from "$lib/components/TagView.svelte"
  export let data
  $: ({ session: _session, supabase } = data)
  $: if (_session) $sessStore = O.some(_session)
  $: session = $sessStore
  // let showing_contents: boolean[][]
  let showing_contents: boolean[] = []
  const note_sync: NoteSync = new NoteSync(supabase, data.session?.user.id)

  let filterSortFun = (n: NoteEx) => {
    return { ...n, priority: Date.parse(n.created_at) }
  }
  let tagFilter: NoteFilter = identity
  let domainFilter: NoteFilter = identity
  let note_groups = note_sync.get_groups(flow(filterSortFun, tagFilter, domainFilter))
  $: note_groups = note_sync.get_groups(flow(filterSortFun, tagFilter, domainFilter))
  onMount(async () => {
    if (O.isNone(session)) redirect(302, "login")
    note_sync.user_id = session.value.user.id // in case updated
    note_sync.sb = supabase // in case updated
    note_sync.sub(handlePayload(note_sync))
    note_sync.refresh_sources()
    note_sync.refresh_notes()
  })

  let close_all_notes = () => {
    showing_contents = showing_contents.map((v) => false)
  }
  close_all_notes()

  let w_rem = 16
  // const handle_keydown = (e: KeyboardEvent) => {
  //   if (e.metaKey && e.key === "z") {
  //     e.preventDefault()
  //     note_sync.restoredelete()
  //     // (e.shiftKey ? redo : undo)();
  //   }
  // }
</script>

<!-- <svelte:window on:keydown={handle_keydown} /> -->

<LoginPrompt {session} />
<!-- {Object.entries($flat_notes).flatMap(([a, b]) => b).length} -->
<TagView {note_sync} bind:tagFilter />
<label for="my-drawer" class="btn btn-primary drawer-button md:hidden"> Open drawer</label>
<div class="drawer md:drawer-open">
  <input id="my-drawer" type="checkbox" class="drawer-toggle" />
  <div class="drawer-content z-0">
    <!-- my main here -->
    <div class="flex flex-row flex-wrap">
      {#each $note_groups as [title, note_group], i}
        <div
          class="border-2 text-center rounded-lg border-neutral"
          style="max-width: {w_rem * note_group.length + 0.25}rem; 
				min-width: {w_rem + 0.15}rem">
          <span class="text-lg text-wrap">{title}</span>
          <div class="flex flex-row flex-wrap overflow-auto">
            {#each note_group as note, j}
              <!-- bind:showing_content={showing_contents[i][j]} -->
              <Note
                note_data={note}
                showing_content={showing_contents[note.id]}
                {close_all_notes}
                {note_sync}
                {w_rem} />
            {/each}
          </div>
        </div>
      {/each}
    </div>
    <!-- class:hidden={get(note_sync.note_del_queue).length == 0}> -->
    <div class="toast toast-end z-10">
      <!-- {$note_del_queue.length} -->
      <!-- <div class="alert alert-info">
        <button on:click={note_sync.restoredelete}>Undo last delete.</button>
      </div> -->
    </div>
  </div>
  <div class="drawer-side z-10">
    <label for="my-drawer" aria-label="close sidebar" class="drawer-overlay"></label>
    <ul class="menu p-4 w-72 min-h-full bg-base-200 text-base-content">
      <!-- <li>
        <Search bind:filterSortFun notes={flat_notes} />
      </li> -->
      <li><DomainFilter {note_groups} bind:domainFilter /></li>
    </ul>
  </div>
</div>
