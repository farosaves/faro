<script lang="ts">
  export let data
  const { supabase } = data
  import { option as O } from "fp-ts"
  import { Dashboard, NoteSync, sessStore } from "shared"
  import { onMount } from "svelte"
  const noteSync = new NoteSync(supabase, undefined)
  // console.log(session?.user.id)
  // console.log(noteSync.noteStore)
  let showLoginPrompt = false

  onMount(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    sessStore.set(O.fromNullable(session))
    if (session) noteSync.setUser_id(session.user.id)
    showLoginPrompt = O.isNone($sessStore)
    if (O.isSome($sessStore)) {
      noteSync.setUser_id($sessStore.value.user.id) // in case updated
      noteSync.sub()
      setTimeout(() => noteSync.refresh_sources().then(() => noteSync.refresh_notes()), 200)
    }
  })
</script>

<Dashboard {noteSync} />
