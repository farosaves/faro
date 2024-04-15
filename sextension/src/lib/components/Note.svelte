<script lang="ts">
  import { _Note as Note, type Notes } from "shared"
  import type { NoteDeri, SyncLike } from "shared"
  import { deleteSnippet, gotoSnippet } from "$lib/utils"
  import { some, type Option } from "fp-ts/lib/Option"
  import type { UUID } from "crypto"
  export let syncLike: SyncLike & Pick<NoteDeri, "allTags">
  const { allTags } = syncLike
  export let note_data: Notes & { searchArt: Option<never> } // no searching
  export let isOpen: boolean
  export let closeAll: () => void
  // export let allTags: Readable<string[]>

  $: goto_function = () => gotoSnippet(note_data.snippet_uuid as UUID)
  $: deleteCbOpt = some(() => deleteSnippet(note_data.snippet_uuid as UUID, note_data.serialized_highlight!))
</script>

<div class="relative">
  <!-- relative binds the tag input placement to this div; the div below should be relative to, but maybe other rules interact with -->
  <Note {note_data} {syncLike} bind:isOpen {closeAll} {goto_function} {deleteCbOpt} {allTags} />
</div>
