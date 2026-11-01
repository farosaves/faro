<script lang="ts">
  import { _Note as Note, type NoteEx } from "$lib"
  import type { NoteDeri, SyncLike } from "$lib"
  import { gotoNoteUrl } from "$lib/chromey/utils"
  export let syncLike: SyncLike & Pick<NoteDeri, "allTags">
  const { allTags } = syncLike
  export let note_data: NoteEx
  export let isOpen: boolean
  export let closeAll: () => void

  $: goto_function = () => gotoNoteUrl(note_data.url)
</script>

<div class="relative">
  <!-- relative binds the tag input placement to this div; the div below should be relative to, but maybe other rules interact with -->
  <Note {note_data} {syncLike} bind:isOpen {closeAll} {goto_function} {allTags} />
</div>
