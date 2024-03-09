<script lang="ts">
  import type { Notes } from "$lib/dbtypes"
  import Note from "$lib/shared/_Note.svelte"
  export let note_sync: NoteSync
  export let note_data: Notes
  export let showing_content: boolean
  export let close_all_notes: () => void
  import _Note from "$lib/shared/_Note.svelte"
  import type { NoteSync } from "$lib/shared/note-sync"
  import { deleteSnippet, gotoSnippet } from "$lib/utils"
  import { some } from "fp-ts/lib/Option"
  $: goto_function = () => gotoSnippet(note_data.snippet_uuid!)
  $: deleteCbOpt = some(() => deleteSnippet(note_data.snippet_uuid!, note_data.serialized_highlight!))
</script>

<Note {note_data} {note_sync} bind:showing_content {close_all_notes} {goto_function} {deleteCbOpt} />
