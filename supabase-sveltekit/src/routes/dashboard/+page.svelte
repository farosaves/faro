<script>
  export let data
  const { mock, supabase, session } = data
  import { option as O } from "fp-ts"
  import { Dashboard, NoteSync, sessStore } from "shared"
  sessStore.set(O.fromNullable(session))
  const note_sync = new NoteSync(supabase, session?.user.id)
  console.log(session?.user.id)
  console.log(note_sync.noteStore)
</script>

<Dashboard {mock} {note_sync} />
