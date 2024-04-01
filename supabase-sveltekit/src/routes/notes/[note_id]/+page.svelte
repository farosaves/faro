<script lang="ts">
  //   import { onMount } from "svelte"
  export let data
  import { page } from "$app/stores"
  import { NoteSync } from "shared"
  import { get } from "svelte/store"
  import { record as R } from "fp-ts"

  let noteId: string

  const { params } = get(page)
  const { noteStore } = new NoteSync(data.supabase, undefined)
  //   onMount(() => {})
  //   R.lookup(noteId,
</script>

<!-- {JSON.stringify(R.keys(get(noteStore)))} -->
