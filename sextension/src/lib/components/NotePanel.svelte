<script lang="ts">
  import type { NoteDeri, SyncLike } from "shared"
  import Note from "$lib/components/Note.svelte"
  import { option as O, array as A } from "fp-ts"
  import { asc, createMock, extractCharIdx, type PendingNote } from "shared"
  import { pipe } from "fp-ts/lib/function"
  import type { NoteMut } from "$lib/note_mut"
  import { derived, type Readable } from "svelte/store"

  export let windowId: Readable<number>
  export let syncLike: SyncLike & Pick<NoteMut, "panels"> & Pick<NoteDeri, "allTags">
  const notePanel = derived([syncLike.panels, windowId], ([p, id]) =>
    (p.get(id) || []).toSorted(asc((t) => extractCharIdx(t.serialized_highlight!))),
  )

  export let optimistic: O.Option<PendingNote> = O.none
  // prettier-ignore
  $: mocked = pipe(optimistic, O.map((r) => { return { ...r, ...createMock() } }))

  $: optimistic = pipe(
    optimistic,
    O.chain((mn) =>
      pipe(
        Object.values($notePanel || []),
        A.findFirst((r) => r.snippet_uuid == mn.snippet_uuid),
        O.match(
          () => O.some(mn),
          (a) => O.none,
        ),
      ),
    ),
  )

  // if (!(source_id in $note_store)) $note_store = []
  let noteOpens = ($notePanel || []).map((_) => false)
  let closeAll = () => {
    noteOpens = noteOpens.map((_) => false)
  }
  // $: console.log($note_store, source_id)
</script>

<!-- {$note_panel.length}<br />{JSON.stringify($curr_source)} -->
<!-- I had to add || [] here... ofc $note_store wasnt guaranteed to be T[]..., is it time to refactor? -->
<!-- I definitely shouldn't "just index" and expect it to work -->
{#each [...$notePanel, ...A.fromOption(mocked)] as note_data, i}
  <Note note_data={{ ...note_data, searchArt: O.none }} bind:isOpen={noteOpens[i]} {closeAll} {syncLike} />
{:else}
  No notes yet...
{/each}
