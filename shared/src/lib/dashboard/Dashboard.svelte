<script lang="ts">
  import { onMount } from "svelte"
  import Note from "./components/Note.svelte"
  import { NoteSync, type SourceData, type SupabaseClient, type SyncLike } from "shared"
  import Search from "./components/Search.svelte"
  import { type NoteEx, Tags } from "shared"
  import DomainFilter from "./components/DomainFilter.svelte"
  import { identity, flow, pipe } from "fp-ts/lib/function"
  import { option as O, record as R } from "fp-ts"
  import { sessStore } from "shared"
  import TagView from "./components/TagView.svelte"
  import { get } from "svelte/store"
  import { domainFilter, fuzzySort, newestFirst, tagFilter } from "./filterSortStores"
  // import Overview from "./components/Overview.svelte"
  // import Tabs from "./components/Tabs.svelte"
  // import type { Notes } from "$lib/db/types"
  import { modalOpenStore, modalStore, modalSub, toastStore } from "$lib"
  import { NoteDeri, type SyncLikeNStores } from "$lib/sync/deri"
  import { fade } from "svelte/transition"
  import type { Action } from "svelte/action"

  export let noteSync: SyncLikeNStores
  const noteDeri = new NoteDeri(noteSync)
  const allTags = noteDeri.allTags

  // let showing_contents: boolean[][]
  let noteOpens: Record<string, boolean> = {}
  // export let note_sync: SyncLike
  $: noteDeri.transformStore.set({
    f: flow($fuzzySort.f, $tagFilter, $domainFilter),
    overrideGroups: $fuzzySort.overrideGroups,
  })
  const note_groupss = noteDeri.groupStore

  let closeAll = () => {
    noteOpens = R.map((v) => false)(noteOpens)
  }
  closeAll()

  let w_rem = 16
  const handle_keydown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "z" && !$modalOpenStore) {
      e.preventDefault()
      ;(e.shiftKey ? noteDeri.sync.redo : noteDeri.sync.undo)()
    }
  }

  let Xview = false
  const priorities = ["5", "0", "-5"] as const
  onMount(() => {
    modalOpenStore.set(false)
  })
</script>

<svelte:head>
  <title>Faros - Dashboard</title>
</svelte:head>

<!-- <LoginPrompt bind:showLoginPrompt /> -->
<svelte:window on:keydown={handle_keydown} />
<!-- <Tabs {note_sync} /> -->
<TagView {noteDeri} />
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
                <Note note_data={note} isOpen={noteOpens[note.id]} {closeAll} {noteSync} {w_rem} {allTags} />
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
        <Search {noteDeri} />
      </li>
      <li></li>
      <li><DomainFilter {noteDeri} /></li>
      <li hidden>
        <button class="underline" on:click={() => (Xview = !Xview)}>x view: {Xview}</button>
      </li>
    </ul>
  </div>
</div>

<dialog id="modal$" class="modal" use:modalSub on:close={() => ($modalOpenStore = false)}>
  <div class="modal-box">
    <!-- <h3 class="font-bold text-lg">{note_data}</h3> -->
    <p class="py-4">
      {$modalStore}
    </p>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>

<div class="toast">
  {#each $toastStore as [toastMsg, n] (n)}
    <div out:fade class="alert alert-info">
      <span>{toastMsg}</span>
    </div>
  {/each}
</div>
