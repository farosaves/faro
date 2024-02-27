<script lang="ts">
  import type { NoteSync } from "../shared/note-sync";
  import Note from "$lib/components/Note.svelte";
  import { option as O, array as A } from "fp-ts";
  import { mock, type MockNote } from "$lib/utils";
  import { pipe } from "fp-ts/lib/function";

  export let note_sync: NoteSync;
  let note_store = note_sync.notestore;
  export let source_id: number;

  export let optimistic: O.Option<MockNote> = O.none;
  // prettier-ignore
  $: mocked = pipe(optimistic, O.map(r => {return {...r, ...mock}}))

  $: optimistic = pipe(
    optimistic,
    O.chain((mn) =>
      pipe(
        $note_store[source_id],
        A.findFirst((r) => r.snippet_uuid == mn.snippet_uuid),
        O.match(
          () => O.some(mn),
          (a) => O.none,
        ),
      ),
    ),
  );
  if (!(source_id in $note_store)) $note_store[source_id] = [];
  let showing_contents = $note_store[source_id].map((_) => false);
  let close_all_notes = () => {
    showing_contents = showing_contents.map((_) => false);
  };
  $: console.log($note_store[source_id], source_id);
</script>

{#each [...A.fromOption(mocked), ...$note_store[source_id]] || [] as note_data, i}
  <Note
    {note_data}
    bind:showing_content={showing_contents[i]}
    {close_all_notes}
    {note_sync} />
{:else}
  No notes yet...
{/each}
