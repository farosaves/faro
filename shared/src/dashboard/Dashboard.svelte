<script lang="ts">
  import { onMount } from "svelte"
  import Note from "./components/Note.svelte"
  import { NoteSync, type SourceData, type SupabaseClient } from "shared"
  import Search from "./components/Search.svelte"
  import { type NoteEx, Tags } from "shared"
  import DomainFilter from "./components/DomainFilter.svelte"
  import { identity, flow, pipe } from "fp-ts/lib/function"
  // import LoginPrompt from "./components/LoginPrompt.svelte"
  import { option as O, record as R } from "fp-ts"
  import { sessStore } from "shared"
  import TagView from "./components/TagView.svelte"
  import { get } from "svelte/store"
  import { domainFilter, fuzzySort, newestFirst, tagFilter } from "./filterSortStores"
  import Overview from "./components/Overview.svelte"
  import { modalOpenStore } from "shared"
  import Tabs from "./components/Tabs.svelte"
  import type { Session } from "@supabase/supabase-js"
  export let data: {
    session: Session
    supabase: SupabaseClient
    mock: { notes: Record<string, NoteEx>; stuMap: Record<string, SourceData["sources"]> } | undefined
  }
  $: ({ session: _session, supabase } = data)
  $: if (_session) $sessStore = O.some(_session)

  // let showing_contents: boolean[][]
  let noteOpens: Record<string, boolean> = {}
  const note_sync: NoteSync = new NoteSync(supabase, data.session?.user.id)

  $: note_sync.transformStore.set(flow($fuzzySort, $tagFilter, $domainFilter))
  const note_groupss = note_sync.groupStore

  let showLoginPrompt = false
  onMount(async () => {
    if (O.isNone($sessStore)) {
      if (data.mock) {
        const mock = data.mock
        showLoginPrompt = R.size({ ...get(note_sync.noteStore), ...mock.notes }) > R.size(mock.notes)
        if (!showLoginPrompt) {
          note_sync.noteStore.update((n) => new Map([...n, ...Object.entries(mock.notes)])) // use user changes to mock notes or just use them
          note_sync.stuMapStore.update((n) => new Map(Object.entries(mock.stuMap)))
        }
      }
    } else {
      note_sync.setUid($sessStore.value.user.id) // in case updated
      note_sync.sb = supabase // in case updated
      note_sync.sub()
      setTimeout(() => note_sync.refresh_sources().then(() => note_sync.refresh_notes()), 2000)
    }
  })

  let closeAll = () => {
    noteOpens = R.map((v) => false)(noteOpens)
  }
  closeAll()

  let w_rem = 16
  const handle_keydown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "z" && !$modalOpenStore) {
      e.preventDefault()
      ;(e.shiftKey ? note_sync.redo : note_sync.undo)()
    }
  }
  // const ns = note_sync.noteStore
  // const na = note_sync.noteArr

  let Xview = false
  const priorities = ["5", "0", "-5"] as const
  $: console.log("ns", get(note_sync.noteStore))
</script>

<svelte:head>
  <title>Faros - Dashboard</title>
</svelte:head>

<!-- <LoginPrompt bind:showLoginPrompt /> -->
<svelte:window on:keydown={handle_keydown} />
<!-- <Tabs {note_sync} /> -->
<TagView {note_sync} />
<label for="my-drawer" class="btn btn-primary drawer-button md:hidden"> Open drawer</label>
<div class="drawer md:drawer-open">
  <input id="my-drawer" type="checkbox" class="drawer-toggle" />
  <div class="drawer-content z-0">
    <!-- my main here -->
    {#each priorities as priority}
      <div
        class="flex flex-row flex-wrap border-secondary pb-2 pt-2"
        class:border-b-2={!!$note_groupss[priority].length}>
        {#each $note_groupss[priority] as [title, note_group], i}
          <div
            class="border-2 text-center rounded-lg border-neutral flex flex-col"
            style="max-width: {w_rem * note_group.length + 0.25}rem;
            min-width: {w_rem + 0.15}rem">
            <span class="text-lg text-wrap flex-grow-0">{@html title}</span>
            <div class="flex flex-row flex-wrap overflow-auto items-stretch flex-grow">
              {#each note_group as note, j}
                <Note note_data={note} isOpen={noteOpens[note.id]} {closeAll} {note_sync} {w_rem} />
              {/each}
            </div>
          </div>
        {/each}
      </div>
    {/each}

    <div class="toast toast-end z-10"></div>
  </div>
  <div class="drawer-side z-10">
    <label for="my-drawer" aria-label="close sidebar" class="drawer-overlay"></label>
    <ul class="menu p-4 w-[72] min-h-full bg-base-300 text-base-content">
      <li>
        <button class="btn btn-sm" on:click={() => ($newestFirst = !$newestFirst)}>
          {$newestFirst ? "New" : "Old"}est first</button>
      </li>
      <li>
        <Search {note_sync} />
      </li>
      <li></li>
      <li><DomainFilter {note_sync} /></li>
      <li hidden>
        <button class="underline" on:click={() => (Xview = !Xview)}>x view: {Xview}</button>
      </li>
    </ul>
  </div>
</div>
