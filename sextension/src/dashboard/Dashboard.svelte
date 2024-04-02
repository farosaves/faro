<script lang="ts">
  import { option as O } from "fp-ts"
  import { supabase, type Session } from "$lib/chromey/bg"
  import { RemoteStore } from "$lib/chromey/messages"
  import { Dashboard, NoteSync, sessStore } from "shared"
  const session = RemoteStore("session", O.none as O.Option<Session>)
  const mock = undefined
  sessStore.set($session)
  const note_sync = new NoteSync(supabase, undefined, "chrome")
  session.subscribe(O.map((sess) => note_sync.setUser_id(sess.user.id)))
  console.log("henlo")
</script>

<!-- <a href="dashboard" class="btn btn-primary">whao</a> -->
{JSON.stringify($session)}
<Dashboard {mock} {note_sync} />
