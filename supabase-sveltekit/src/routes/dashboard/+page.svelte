<script lang="ts">
  import { onMount } from "svelte"
  import Note from "$lib/components/Note.svelte"
  import { NoteSync } from "shared"
  import Search from "$lib/components/Search.svelte"
  import { type NoteEx, Tags } from "shared"
  import DomainFilter from "$lib/components/DomainFilter.svelte"
  import { identity, flow, pipe } from "fp-ts/lib/function"
  import LoginPrompt from "$lib/components/LoginPrompt.svelte"
  import { option as O, record as R } from "fp-ts"
  import { type NoteFilter } from "$lib/utils"
  import { sessStore } from "shared"
  import TagView from "$lib/components/TagView.svelte"
  import { get } from "svelte/store"
  import { domainFilter, fuzzySort, tagFilter } from "$lib/filterSortStores.js"
  export let data
  $: ({ session: _session, supabase } = data)
  $: if (_session) $sessStore = O.some(_session)

  // let showing_contents: boolean[][]
  let showing_contents: Record<string, boolean> = {}
  const note_sync: NoteSync = new NoteSync(supabase, data.session?.user.id)

  $: note_sync.transformStore.set(flow($fuzzySort, $tagFilter, $domainFilter))
  const note_groups = note_sync.groupStore
  console.log($note_groups.length)

  let showLoginPrompt = false
  onMount(async () => {
    if (O.isNone($sessStore)) {
      if (data.mock) {
        const mock = data.mock
        showLoginPrompt = R.size({ ...get(note_sync.notestore), ...mock.notes }) > R.size(mock.notes)
        if (!showLoginPrompt) {
          note_sync.notestore.update((n) => ({ ...n, ...mock.notes })) // use user changes to mock notes or just use them
          note_sync.stuMapStore.update((n) => ({ ...mock.stuMap }))
        }
      }
    } else {
      note_sync.setUid($sessStore.value.user.id) // in case updated
      note_sync.sb = supabase // in case updated
      note_sync.sub()
      setTimeout(() => note_sync.refresh_sources().then(() => note_sync.refresh_notes()), 2000)
    }
  })

  let close_all_notes = () => {
    showing_contents = R.map((v) => false)(showing_contents)
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
  // const ns = note_sync.notestore
  // const na = note_sync.noteArr
</script>

<!-- {$na[0]?.quote}
{$note_groups[0]} -->
{showLoginPrompt}
<LoginPrompt bind:showLoginPrompt />
<!-- {Object.entries($flat_notes).flatMap(([a, b]) => b).length} -->
<TagView {note_sync} />
<label for="my-drawer" class="btn btn-primary drawer-button md:hidden"> Open drawer</label>
<div class="drawer md:drawer-open">
  <input id="my-drawer" type="checkbox" class="drawer-toggle" />
  <div class="drawer-content z-0">
    <!-- my main here -->
    <div class="flex flex-row flex-wrap">
      {#each $note_groups as [title, note_group], i}
        <div
          class="border-2 text-center rounded-lg border-neutral flex flex-col"
          style="max-width: {w_rem * note_group.length + 0.25}rem; 
				min-width: {w_rem + 0.15}rem">
          <span class="text-lg text-wrap flex-grow-0">{@html title}</span>
          <div class="flex flex-row flex-wrap overflow-auto items-stretch flex-grow">
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
    <ul class="menu p-4 w-[72] min-h-full bg-base-200 text-base-content">
      <li>
        <Search {note_sync} />
      </li>
      <li></li>
      <li><DomainFilter {note_sync} /></li>
    </ul>
  </div>
</div>
