<script lang="ts">
  //   import { onMount } from "svelte"
  export let data
  import { page } from "$app/stores"
  import { NoteSync } from "shared"
  import { get } from "svelte/store"
  import { record as R, map as M } from "fp-ts"
  import type { UUID } from "crypto"

  let noteId: string

  const { params } = get(page)
  console.log(data.session?.user.id)
  const { noteStore, stuMapStore } = new NoteSync(data.supabase, data.session?.user.id)
  const n = get(noteStore).get("3e88b49c-aa4e-47b5-b356-5c38f1a6ac0d")
  const a = get(stuMapStore).get((n?.source_id as UUID) || "")

  //   R.lookup(noteId,
</script>

<svelte:window on:mouseup={() => console.log(window.getSelection())} />
hmm?
<iframe width="100%" height="1000px" src={a?.url} />

<!-- {JSON.stringify([...get(noteStore).keys()])} -->
