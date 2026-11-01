<script lang="ts">
  import type { NoteDeri, SyncLike } from "$lib"
  import Note from "$lib/components/Note.svelte"
  import { altKey, asc, note2NoteEx } from "$lib"
  import type { NoteMut } from "$lib/note_mut"
  import { derived, type Readable } from "svelte/store"
  import { loc } from "$lib/chromey/utils"

  export let windowId: Readable<number>
  export let syncLike: SyncLike & Pick<NoteMut, "panels"> & Pick<NoteDeri, "allTags">
  const notePanel = derived([syncLike.panels, windowId], ([p, id]) =>
    (p.get(id) || []).toSorted(asc((t) => Date.parse(t.created_at))),
  )

  let noteOpens = ($notePanel || []).map((_) => false)
  let closeAll = () => {
    noteOpens = noteOpens.map((_) => false)
  }
</script>

{#each $notePanel as note_data, i}
  <Note note_data={note2NoteEx(note_data)} bind:isOpen={noteOpens[i]} {closeAll} {syncLike} />
{:else}
  <div class="w-full text-center">
    {loc("noSavesYet")}...<br />
    <div class="underline tooltip" data-tip="{loc('howToExpl')} {altKey} + X">
      {loc("howToAdd")}
    </div>
  </div>
{/each}
