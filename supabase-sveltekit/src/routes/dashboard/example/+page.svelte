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
  import { tutorialStep } from "./common.js"
  import { fade } from "svelte/transition"

  const T = trpc()
  const noteSync = new NoteSync(supabase, undefined, async () => false)
  noteSync.noteStore = persisted("mockNoteStore", new Map(), { serializer: devalue })
  noteSync.stuMapStore = persisted("mockStuMapStore", new Map(), { serializer: devalue })
  noteSync.actionQueue.queueStore = persisted("mockActionQueue", new Map(), { serializer: devalue })
  noteSync.actionQueue.queueStore.subscribe((as) => as.length && noteSync.actionQueue.queueStore.set([]))
  console.log(get(noteSync.noteStore))

  const mock = { notes: new Map(), stuMap: new Map() as STUMap }

  onMount(async () => {
    const notes = (
      await T.multipleNotes.query([
        "4afc1421-9eb2-4532-b2c1-c39c355ad811",
        "64ba8738-2d05-48f6-9395-7019deff2ec4",
        "85ef627b-66d5-4304-a1b7-bd57b4a1c33f",
        "fec270c5-ba93-45f1-9c48-93f19f83c59a",
        "96cf304f-90f8-404b-b5b4-bea4a741a386",
        "a6a71bdc-0fd5-4a7b-bccc-2d6800909f17",
        "22c41cc7-2f91-468d-9551-855ace0068c8",
        "d122648b-cb6c-434f-bbea-2455ff6891ab",
      ])
    ).data?.map((n) => ({ ...n, prioritised: 0 }))

    window.umami.track("example dashboard open")
    if (!notes) return
    mock.notes = new Map(notes.map((n) => [n.id, n]))
    const srcs = (await T.multipleSources.query(notes.map((n) => n.source_id))).data || []

    mock.stuMap = new Map(srcs.map((s) => [s.id as UUID, fillInTitleDomain(s)]))

    // showLoginPrompt = M.size(new Map([...get(noteSync.noteStore), ...mock.notes])) > M.size(mock.notes)
    // if (!showLoginPrompt) {
    noteSync.noteStore.update((n) => new Map([...mock.notes, ...n])) // use user changes to mock notes or just use them
    noteSync.stuMapStore.update((_n) => mock.stuMap)

    noteSync.noteStore.subscribe((_) => window.umami.track("example dashboard update"))

    tutorialStep.set(1)
  })

  function positionElementRelativeToFixed(
    fixedElement: Element | null,
    elementToPosition: HTMLElement | null,
    offsetX = 0,
    offsetY = 0,
  ) {
    if (!fixedElement || !elementToPosition) {
      console.error("No fixed element or element to position")
      return
    }
    // Get the bounding rectangle of the fixed element
    const fixedRect = fixedElement.getBoundingClientRect()

    // Set the position of the element to be positioned
    elementToPosition.style.left = `${fixedRect.left + offsetX}px`
    elementToPosition.style.top = `${fixedRect.bottom + offsetY}px`

    // Ensure the positioned element doesn't go off-screen
    const elementRect = elementToPosition.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    if (elementRect.right > viewportWidth) {
      elementToPosition.style.left = `${viewportWidth - elementRect.width}px`
    }

    if (elementRect.bottom > viewportHeight) {
      elementToPosition.style.top = `${fixedRect.top - elementRect.height - offsetY}px`
    }
  }

  // Usage example
</script>

{#if $tutorialStep === 1}
  <div
    class="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
    id="tooltip"
    transition:fade>
    <div class="bg-base-100 shadow-lg pointer-events-auto w-96 py-4">
      <div class="flex flex-col place-content-center items-center">
        <span class="text-2xl font-semibold my-4">Faro dashboard tutorial</span>
        <span class="text-lg font-semibold my-4">Welcome! Let's get you started.</span>
        <div class="flex items-center">
          <button class="btn btn-sm my-4 opacity-0 mx-1" disabled>Disable tutorial</button>
          <!-- svelte-ignore a11y-autofocus -->
          <button class="btn btn-primary my-4 mx-1" autofocus on:click={() => tutorialStep.set(2)}>
            Start</button>
          <button class="btn btn-sm my-4 mx-1" on:click={() => tutorialStep.set(0)}>Disable tutorial</button>
        </div>
        <button
          class="btn btn-sm"
          on:click={() =>
            positionElementRelativeToFixed(
              document.getElementsByClassName("expander-parent").item(0),
              document.getElementById("tooltip"),
              // 10,
              // 5,
            )}>
          Position Tooltip
        </button>
      </div>
    </div>
  </div>
{/if}

<Dashboard {noteSync} />
