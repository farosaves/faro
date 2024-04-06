<script>
  export let data
  const { supabase, session } = data
  import { option as O, map as M } from "fp-ts"
  import { Dashboard, NoteSync, sessStore } from "shared"
  import { onMount } from "svelte"
  import { get } from "svelte/store"
  sessStore.set(O.fromNullable(session))
  const noteSync = new NoteSync(supabase, session?.user.id)
  console.log(session?.user.id)
  console.log(noteSync.noteStore)
  let showLoginPrompt = false
  onMount(async () => {
    if (O.isNone($sessStore)) {
      if (data.mock) {
        const mock = data.mock
        showLoginPrompt = M.size(new Map([...get(noteSync.noteStore), ...mock.notes])) > M.size(mock.notes)
        if (!showLoginPrompt) {
          noteSync.noteStore.update((n) => new Map([...n, ...Object.entries(mock.notes)])) // use user changes to mock notes or just use them
          noteSync.stuMapStore.update((n) => mock.stuMap)
        }
      }
    } else {
      noteSync.setUser_id($sessStore.value.user.id) // in case updated
      noteSync.sub()
      setTimeout(() => noteSync.refresh_sources().then(() => noteSync.refresh_notes()), 200)
    }
  })
</script>

<Dashboard {noteSync} />
