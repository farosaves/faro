<script lang="ts">
  export let data
  const { supabase } = data
  import { map as M } from "fp-ts"
  import { Dashboard, fillInTitleDomain, NoteSync, persisted, type STUMap } from "shared"
  import { onMount } from "svelte"
  import { get } from "svelte/store"
  import * as devalue from "devalue"
  import { trpc } from "$lib/trpc/client.js"
  import type { UUID } from "crypto"

  const T = trpc()
  const noteSync = new NoteSync(supabase, undefined, async () => false)
  noteSync.noteStore = persisted("mockNoteStore", new Map(), { serializer: devalue })
  noteSync.stuMapStore = persisted("mockStuMapStore", new Map(), { serializer: devalue })
  noteSync.actionQueue.queueStore = persisted("mockActionQueue", new Map(), { serializer: devalue })
  noteSync.actionQueue.queueStore.subscribe((as) => as.length && noteSync.actionQueue.queueStore.set([]))
  console.log(get(noteSync.noteStore))
  let showLoginPrompt = false

  const mock = { notes: new Map(), stuMap: new Map() as STUMap }
  onMount(async () => {
    const notes = (
      await T.multipleNotes.query([
        "4afc1421-9eb2-4532-b2c1-c39c355ad811",
        "64ba8738-2d05-48f6-9395-7019deff2ec4",
      ])
    ).data
    if (!notes) return
    mock.notes = new Map(notes.map((n) => [n.id, n]))
    const srcs = (await T.multipleSources.query(notes.map((n) => n.source_id))).data || []
    // this.stuMapStore.update((ss) => {
    //   nss.forEach(s => ss.set(s.id as UUID, fillInTitleDomain(s)))
    //   return ss
    // })

    mock.stuMap = new Map(srcs.map((s) => [s.id as UUID, fillInTitleDomain(s)]))

    // showLoginPrompt = M.size(new Map([...get(noteSync.noteStore), ...mock.notes])) > M.size(mock.notes)
    // if (!showLoginPrompt) {
    noteSync.noteStore.update((n) => new Map([...mock.notes, ...n])) // use user changes to mock notes or just use them
    noteSync.stuMapStore.update((_n) => mock.stuMap)
    // }
  })
</script>

<Dashboard {noteSync} />
