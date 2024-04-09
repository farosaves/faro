<script lang="ts">
  export let data
  const { supabase, session } = data
  import { option as O, map as M } from "fp-ts"
  import { Dashboard, NoteSync, sessStore } from "shared"
  import { onMount } from "svelte"
  import { get } from "svelte/store"
  import { ActionQueue } from "../../../../shared/dist/sync/queue.js"
  sessStore.set(O.fromNullable(session))
  const noteSync = new NoteSync(supabase, session?.user.id)
  // console.log(session?.user.id)
  // console.log(noteSync.noteStore)
  let showLoginPrompt = false
  onMount(async () => {
    showLoginPrompt = O.isNone($sessStore)
    if (O.isSome($sessStore)) {
      noteSync.setUser_id($sessStore.value.user.id) // in case updated
      noteSync.sub()
      setTimeout(() => noteSync.refresh_sources().then(() => noteSync.refresh_notes()), 200)
    }
  })
</script>

<Dashboard {noteSync} />
