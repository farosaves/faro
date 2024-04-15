<script lang="ts">
  export let data
  const { supabase, mock } = data
  import { map as M } from "fp-ts"
  import { Dashboard, NoteSync, persisted } from "shared"
  import { onMount } from "svelte"
  import { get } from "svelte/store"
  import * as devalue from "devalue"
  const noteSync = new NoteSync(supabase, undefined, async () => true)
  noteSync.noteStore = persisted("mockNoteStore", new Map(), { serializer: devalue })
  noteSync.stuMapStore = persisted("mockStuMapStore", new Map(), { serializer: devalue })
  noteSync.actionQueue.queueStore = persisted("mockActionQueue", new Map(), { serializer: devalue })
  noteSync.actionQueue.queueStore.subscribe((as) => as.length && noteSync.actionQueue.queueStore.set([]))
  console.log(get(noteSync.noteStore))
  let showLoginPrompt = false
  onMount(async () => {
    console.log(mock)
    showLoginPrompt = M.size(new Map([...get(noteSync.noteStore), ...mock.notes])) > M.size(mock.notes)
    if (!showLoginPrompt) {
      noteSync.noteStore.update((n) => new Map([...n, ...mock.notes])) // use user changes to mock notes or just use them
      noteSync.stuMapStore.update((n) => mock.stuMap)
    }
  })
</script>

<Dashboard {noteSync} />
