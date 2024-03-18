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
    const url = note_data.sources.url
    console.log(url)
    url && open(url)
  }
</script>

<div class="relative" style="max-width: {w_rem}rem; min-width: {w_rem}rem ">
  <Note {note_data} bind:isOpen {closeAll} {note_sync} {goto_function} />
</div>
