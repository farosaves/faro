<script lang="ts">
  import Note from "$lib/shared/_Note.svelte";
  // import { _Note as N } from "shared";
  export let w_rem = 16;
  export let note_data: NoteEx;
  export let showing_content: boolean;
  export let close_all_notes: () => void;
  export let note_sync: NoteSync;
  // import _Note from "$lib/shared/_Note.svelte";
  import type { NoteEx } from "$lib/shared/first";
  import type { NoteSync } from "$lib/shared/note-sync";
  let goto_function = async () => {
    const url = note_data.sources.url;
    console.log(url);
    url && open(url);
  };
</script>

<div style="max-width: {w_rem}rem; min-width: {w_rem}rem">
  <Note
    {note_data}
    bind:showing_content
    {close_all_notes}
    {note_sync}
    {goto_function} />
</div>
