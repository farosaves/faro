<script lang="ts">
  export let data
  const { supabase } = data
  import { map as M } from "fp-ts"
  import { Dashboard, NoteSync, persisted } from "shared"
  import { onMount } from "svelte"
  import { get } from "svelte/store"
  import * as devalue from "devalue"
  import { trpc } from "$lib/trpc/client.js"

  const T = trpc()
  const noteSync = new NoteSync(supabase, undefined, async () => false)
  noteSync.noteStore = persisted("mockNoteStore", new Map(), { serializer: devalue })
  noteSync.stuMapStore = persisted("mockStuMapStore", new Map(), { serializer: devalue })
  noteSync.actionQueue.queueStore = persisted("mockActionQueue", new Map(), { serializer: devalue })
  noteSync.actionQueue.queueStore.subscribe((as) => as.length && noteSync.actionQueue.queueStore.set([]))
  console.log(get(noteSync.noteStore))
  let showLoginPrompt = false
  const mock = { notes: new Map(), stuMap: new Map() }
  onMount(async () => {
    showLoginPrompt = M.size(new Map([...get(noteSync.noteStore), ...mock.notes])) > M.size(mock.notes)
    if (!showLoginPrompt) {
      noteSync.noteStore.update((n) => new Map([...n, ...mock.notes])) // use user changes to mock notes or just use them
      noteSync.stuMapStore.update((n) => mock.stuMap)
    }
  })
</script>

<Dashboard {noteSync} />
