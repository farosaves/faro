<script lang="ts">
  import { _Note as Note, type Notes } from "shared"
  import type { NoteSync } from "shared"
  import { deleteSnippet, gotoSnippet } from "$lib/utils"
  import { some, type Option } from "fp-ts/lib/Option"
  export let note_sync: NoteSync
  export let note_data: Notes & { searchArt: Option<never> } // no searching
  export let isOpen: boolean
  export let closeAll: () => void
  $: goto_function = () => gotoSnippet(note_data.snippet_uuid!)
  $: deleteCbOpt = some(() => deleteSnippet(note_data.snippet_uuid!, note_data.serialized_highlight!))
</script>

<Note {note_data} {note_sync} bind:isOpen {closeAll} {goto_function} {deleteCbOpt} />
