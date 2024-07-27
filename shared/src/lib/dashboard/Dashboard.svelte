<script lang="ts">
  import { onMount } from "svelte"
  import Note from "../_Note.svelte"
  import Search from "./components/Search.svelte"
  import DomainFilter from "./components/DomainFilter.svelte"
  import { flow, pipe } from "fp-ts/lib/function"
  import { record as R, tuple as T, array as A } from "fp-ts"
  import TagView from "./components/TagView.svelte"
  import { domainFilter, fuzzySort, newestFirst, tagFilter, priorityFilter } from "./filterSortStores"
  // import Overview from "./components/Overview.svelte"
  // import Tabs from "./components/Tabs.svelte"
  // import type { Notes } from "$lib/db/types"
  import {
    activeLoadsStore,
    hasExtensionStore,
    modalOpenStore,
    tagModalOpenStore,
    toastStore,
    windowActive,
  } from "../stores"
  import { NoteDeri, type SyncLikeNStores } from "$lib/sync/deri"
  import { fade } from "svelte/transition"
  import CmModal from "./components/CmModal.svelte"
  import PriorityFilter from "./components/PriorityFilter.svelte"
  import { gotoFunction } from "./utils"
  import { derived, writable } from "svelte/store"

  export let noteSync: SyncLikeNStores
  export let isInExt = false
  const noteDeri = new NoteDeri(noteSync)
  const idHighlighted = noteDeri.idHighlighted
  const allTags = noteDeri.allTags

  // let showing_contents: boolean[][]
  let noteOpens: Record<string, boolean> = {}
  // export let note_sync: SyncLike
  $: noteDeri.transformStore.set({
    f: flow($fuzzySort.f, $tagFilter, $domainFilter, $priorityFilter),
    overrideGroups: $fuzzySort.overrideGroups,
  })
  const note_groupss = noteDeri.groupStore

  let closeAll = () => {
    noteOpens = R.map((v) => false)(noteOpens)
  }
  closeAll()

  const handle_keydown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "z" && !$modalOpenStore && !$tagModalOpenStore) {
      e.preventDefault()
      ;(e.shiftKey ? noteDeri.sync.redo : noteDeri.sync.undo)()
    }
  }

  let Xview = false
  const priorities = ["5", "0", "-5"] as const
  onMount(() => {
    modalOpenStore.set(false)
    windowActive.set(true)
    isInExt && hasExtensionStore.set(true)
    fetch("chrome-extension://pdndbnolgapjdcebajmgcehndggfegeo/icon.svg")
      .then((_r) => hasExtensionStore.set(true))
      .catch(() => undefined)
  })
  let innerWidth: number
  const tilesWidth = writable(800)
  // min width for note is 256px
  const layoutey = derived(tilesWidth, (tW) => {
    const nNotes = Math.min(Math.floor(tW / 256), 5)
    const noteWidth = Math.floor(tW / nNotes) - 4

    // I'll need this code when doing infinite scroll

    // const rowize: (x: [string, NoteEx[]][]) => [string, NoteEx[]][][] = (x) => {
    //   const ret: NonEmptyArray<[string, NoteEx[]][]> = [[]]
    //   for (const [t, noteGroup] of x) {
    //     const l = ret.at(-1)!.length // force cuz nonempty
    //     if (l + noteGroup.length <= nNotes) ret.at(-1)!.push([t, noteGroup])
    //     else ret.push([[t, noteGroup]])
    //   }
    //   return ret
    // }
    return { noteWidth, nNotes }
  })
</script>

<svelte:head>
  <title>Faros - Dashboard</title>
</svelte:head>

<!-- <LoginPrompt bind:showLoginPrompt /> -->
<svelte:window on:keydown={handle_keydown} bind:innerWidth />
<!-- <Tabs {note_sync} /> -->

<TagView {noteDeri} />
<label for="my-drawer" class="btn btn-primary drawer-button md:hidden"> Open drawer</label>
<div class="drawer md:drawer-open bg-base-300">
  <input id="my-drawer" type="checkbox" class="drawer-toggle" />
  <div class="drawer-content z-0" bind:clientWidth={$tilesWidth}>
    <!-- my main here -->
    {#each priorities as priority}
      <div
        class="flex flex-row flex-wrap border-secondary py-2"
        class:border-b-2={!!$note_groupss[priority].length}>
        {#each $note_groupss[priority] as [title, note_group]}
          <div
            class="border-2 text-center rounded-lg border-neutral flex flex-col bg-base-200"
            style="width: {(note_group.length / $layoutey.nNotes) * 100}%">
            <!-- style="max-width: {$layoutey.noteWidth * note_group.length + 4}px;
            min-width: {$layoutey.noteWidth + 2}px" -->
            <!-- "max-w-[{wRem * note_group.length * 4 + 1}] min-w-[{wRem * note_group.length * 4 + 1}]" -->
            <a
              target="_blank"
              title={title.replaceAll(/<\/?b[^>]*>/g, "")}
              href={note_group[0].url}
              class="text-lg text-wrap overflow-clip flex-grow-0 hover:underline max-h-20">{@html title}</a>
            <div class="flex flex-row flex-wrap overflow-auto items-stretch flex-grow justify-center">
              {#each note_group as note (note.id)}
                <Note
                  note_data={note}
                  isOpen={noteOpens[note.id]}
                  {closeAll}
                  goto_function={gotoFunction(note)}
                  syncLike={noteSync}
                  px={innerWidth > 768 ? $layoutey.noteWidth : undefined}
                  {allTags}
                  isHighlighted={note.id == $idHighlighted} />
              {/each}
            </div>
          </div>
        {/each}
      </div>
    {/each}
  </div>
  <div class="drawer-side z-10 border-r border-neutral">
    <label for="my-drawer" aria-label="close sidebar" class="drawer-overlay"></label>
    <ul class="menu p-4 w-[72] min-h-full bg-base-200 text-base-content space-y-4 mt-24 md:mt-0">
      <li class="pt-4">
        <button
          class="btn btn-sm bg-base-100 border-neutral mx-4"
          on:click={() => ($newestFirst = !$newestFirst)}>
          {$newestFirst ? "New" : "Old"}est first</button>
      </li>
      <li>
        <Search {noteDeri} openFirst={noteDeri.openFirst} />
      </li>
      <li></li>
      <li><DomainFilter {noteDeri} /></li>
      {#if false}
        <li hidden class="fixed bottom-8 left-12"><PriorityFilter noteArr={noteDeri.noteArr} /></li>
        <li hidden>
          <button class="underline" on:click={() => (Xview = !Xview)}>x view: {Xview}</button>
        </li>
      {/if}
    </ul>
  </div>
</div>

<CmModal />
<div class="toast">
  {#if $activeLoadsStore}
    <span out:fade class="loading loading-spinner text-secondary loading-lg"></span>
  {/if}
</div>

<div class="toast">
  {#each $toastStore as [toastMsg, n] (n)}
    <div out:fade class="alert alert-info">
      <span>{toastMsg}</span>
    </div>
  {/each}
</div>
