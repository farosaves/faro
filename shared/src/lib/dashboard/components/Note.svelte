<script lang="ts">
  import type { SyncLike } from "$lib"
  import { _Note as Note, type NoteEx } from "shared"
  import type { Readable } from "svelte/store"

  export let w_rem = 16
  export let note_data: NoteEx
  export let isOpen: boolean
  export let closeAll: () => void
  export let noteSync: SyncLike
  export let allTags: Readable<string[]>

  let goto_function = async () => {
    const url = new URL(note_data.sources.url)
    console.log("title", note_data.sources.title)
    note_data.snippet_uuid && url.searchParams.set("highlightUuid", note_data.snippet_uuid)
    console.log(url)
    url && open(url)
  }
</script>

<div class="relative" style="max-width: {w_rem}rem; min-width: {w_rem}rem ">
  <Note {note_data} bind:isOpen {closeAll} syncLike={noteSync} {goto_function} {allTags} />
</div>
