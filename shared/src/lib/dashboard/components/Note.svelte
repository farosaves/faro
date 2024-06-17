<!-- <script lang="ts">
  import type { SyncLike } from "$lib"
  import { _Note as Note, type NoteEx } from "shared"
  import type { Readable } from "svelte/store"
  import { gotoFunction } from "../utils"

  export let w_rem = 16
  export let note_data: NoteEx
  export let isOpen: boolean
  export let closeAll: () => void
  export let noteSync: SyncLike
  export let allTags: Readable<string[]>

  let goto_function = gotoFunction(note_data)
</script>

<div class="relative" style="max-width: {w_rem}rem; min-width: {w_rem}rem ">
  <Note {note_data} bind:isOpen {closeAll} syncLike={noteSync} {goto_function} {allTags} />
</div> -->
