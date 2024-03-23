<script lang="ts">
  import { _Note as Note, type NoteEx } from "shared"

  export let w_rem = 16
  export let note_data: NoteEx
  export let isOpen: boolean
  export let closeAll: () => void
  export let note_sync: NoteSync
  // import type { NoteEx } from "shared";

  import type { NoteSync } from "shared"
  let goto_function = async () => {
    const url = new URL(note_data.sources.url)
    note_data.snippet_uuid && url.searchParams.set("highlightUuid", note_data.snippet_uuid)
    console.log(url)
    url && open(url)
  }
</script>

<div class="relative" style="max-width: {w_rem}rem; min-width: {w_rem}rem ">
  <Note {note_data} bind:isOpen {closeAll} syncLike={note_sync} {goto_function} />
</div>
