<script lang="ts">
  import type { NoteSync } from "shared"
  import Note from "$lib/components/Note.svelte"
  import { option as O, array as A } from "fp-ts"
  import { createMock, type PendingNote } from "shared"
  import { pipe } from "fp-ts/lib/function"
  import type { NoteMut } from "$lib/note_mut"

  export let note_sync: NoteSync
  export let note_mut: NoteMut
  const note_panel = note_mut.panel

  export let optimistic: O.Option<PendingNote> = O.none
  // prettier-ignore
  $: mocked = pipe(optimistic, O.map(r => {return {...r, ...createMock()}}))

  $: optimistic = pipe(
    optimistic,
    O.chain((mn) =>
      pipe(
        Object.values($note_panel || []),
        A.findFirst((r) => r.snippet_uuid == mn.snippet_uuid),
        O.match(
          () => O.some(mn),
          (a) => O.none,
        ),
      ),
    ),
  )

  // if (!(source_id in $note_store)) $note_store = []
  let showing_contents = Object.values($note_panel).map((_) => false)
  let close_all_notes = () => {
    showing_contents = showing_contents.map((_) => false)
  }
  // $: console.log($note_store, source_id)
  const curr_source = note_mut.curr_source
</script>

<!-- {$note_panel.length}<br />{JSON.stringify($curr_source)} -->
<!-- I had to add || [] here... ofc $note_store wasnt guaranteed to be T[]..., is it time to refactor? -->
<!-- I definitely shouldn't "just index" and expect it to work -->
{#each [...(Object.values($note_panel) || []), ...A.fromOption(mocked)] as note_data, i}
  <Note
    note_data={{ ...note_data, searchArt: O.none }}
    bind:showing_content={showing_contents[i]}
    {close_all_notes}
    {note_sync} />
{:else}
  No notes yet...
{/each}
