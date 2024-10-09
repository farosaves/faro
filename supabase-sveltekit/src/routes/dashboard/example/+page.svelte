<script lang="ts">
  export let data
  const { supabase } = data
  import {
    ctrlKey,
    Dashboard,
    DEBUG,
    exclTagSet,
    fillInTitleDomain,
    hasExtensionStore,
    NoteSync,
    persisted,
    type STUMap,
  } from "shared"
  import IconLogosChromeWebStore from "~icons/logos/chrome-web-store"
  import { onMount } from "svelte"
  import { get } from "svelte/store"
  import * as devalue from "devalue"
  import { trpc } from "$lib/trpc/client.js"
  import type { UUID } from "crypto"
  import { getElementByText, tutorialStep } from "./common.js"
  import Popover from "./Popover.svelte"

  const T = trpc()
  const noteSync = new NoteSync(supabase, undefined, async () => false)
  noteSync.noteStore = persisted("mockNoteStore", new Map(), { serializer: devalue })
  noteSync.stuMapStore = persisted("mockStuMapStore", new Map(), { serializer: devalue })
  noteSync.actionQueue.queueStore = persisted("mockActionQueue", new Map(), { serializer: devalue })
  noteSync.actionQueue.queueStore.subscribe((as) => as.length && noteSync.actionQueue.queueStore.set([]))
  console.log(get(noteSync.noteStore))

  const mock = { notes: new Map(), stuMap: new Map() as STUMap }

  let startingTags: Set<string> = new Set()

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
        "4b859d3c-7959-4170-bacf-891adbc1eaa7",
      ])
    ).data?.map((n) => ({ ...n, prioritised: 0 }))
    DEBUG && console.log(notes)
    !DEBUG && window.umami.track("example dashboard open")
    if (!notes) return
    startingTags = new Set(notes.map((n) => n.tags).flat())
    mock.notes = new Map(notes.map((n) => [n.id, n]))
    const srcs = (await T.multipleSources.query(notes.map((n) => n.source_id))).data || []

    mock.stuMap = new Map(srcs.map((s) => [s.id as UUID, fillInTitleDomain(s)]))

    // showLoginPrompt = M.size(new Map([...get(noteSync.noteStore), ...mock.notes])) > M.size(mock.notes)
    // if (!showLoginPrompt) {
    noteSync.noteStore.update((n) => new Map([...mock.notes, ...n])) // use user changes to mock notes or just use them
    noteSync.stuMapStore.update((_n) => mock.stuMap)

    tutorialStep.set(1)
    if (
      get(noteSync.noteStore)
        .values()
        .some((n) => n.tags.includes("art/music"))
    )
      tutorialStep.set(11)

    tutorialStep.subscribe((step) => {
      if (step === 3)
        setTimeout(() => {
          const elem = getElementByText("items-stretch", "rubato", 0)
          elem?.addEventListener("click", () => tutorialStep.set("addTag"), { once: true })
        }, 150)
      else if (
        step === "addTag" &&
        get(noteSync.noteStore)
          .values()
          .flatMap((n) => n.tags)
          .some((t) => !startingTags.has(t))
      )
        $tutorialStep = 5
      else if (step === 12) {
        const element = getElementByText("mb-2", "Sites", 0)
        element?.addEventListener("click", () => setTimeout(() => tutorialStep.set(13), 500), { once: true })
      } else if (step === 13) {
        const element = getElementByText("max-w-xs", "", 0)
        element?.addEventListener("input", (e) => {
          if ((e.target as HTMLInputElement).value === "dim" && step === 13)
            setTimeout(() => tutorialStep.set(14), 500)
        })
      }
    })
  })
  exclTagSet.subscribe((s) => {
    if ($tutorialStep === 2) $tutorialStep = 3
    else if (
      $tutorialStep === "addTag" &&
      get(noteSync.noteStore)
        .values()
        .flatMap((n) => n.tags)
        .some((t) => !startingTags.has(t))
    ) {
      $tutorialStep = 5
      setTimeout(() => document.getElementById("hackybtn")!.click(), 100)
    } else if ($tutorialStep === 11) setTimeout(() => ($tutorialStep = "toggle all"), 3000)
    else if ($tutorialStep === "toggle all" && s.size === 0) setTimeout(() => ($tutorialStep = 12), 1000)
  })
  $: console.log($tutorialStep)
  const handle_keydown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
      if ($tutorialStep === 5) $tutorialStep = 6
    } else if ((e.metaKey || e.ctrlKey) && e.key === "z" && e.shiftKey) {
      if ($tutorialStep === 6) $tutorialStep = 7
    }
  }
  noteSync.noteStore.subscribe((ns) => {
    if (
      $tutorialStep === 7 &&
      ns
        .values()
        .map((n) => n.prioritised)
        .some((p) => p > 0)
    )
      $tutorialStep = 8
    else if ($tutorialStep === 10 && ns.values().some((n) => n.tags.includes("art/music"))) $tutorialStep = 11
  })
</script>

<svelte:window on:keydown={handle_keydown} />

<Dashboard {noteSync} />

{#if $tutorialStep === 1}
  <Popover>
    <span class="text-2xl font-semibold my-4">Faro dashboard tutorial</span>
    <span class="text-lg font-semibold my-4">Welcome! Let's get you started.</span>
    <div class="flex items-center">
      <button class="btn btn-sm my-4 opacity-0 mx-1" disabled>Disable tutorial</button>
      <button class="btn btn-primary my-4 mx-1" autofocus on:click={() => tutorialStep.set(2)}>Start</button>
      <button class="btn btn-sm my-4 mx-1" on:click={() => tutorialStep.set(0)}>Disable tutorial</button>
    </div>
  </Popover>
{:else if $tutorialStep === 2}
  <Popover arrow={true} className="expander-parent" text="whale">
    <span class="text-lg font-semibold my-4">These here are tags</span>
    <span class="font-semibold mb-4">Click one to filter by it.</span>
  </Popover>
{:else if $tutorialStep === 3}
  <Popover arrow={true} className="items-stretch" text="rubato" align={"top"}>
    <span class="text-lg font-semibold my-4">To open your save</span>
    <span class="font-semibold mb-4">Just click the note here.</span>
    <span class=" mb-4">Remember to come back after ;)</span>
  </Popover>
{:else if $tutorialStep === "addTag"}
  <Popover arrow={true} className="min-h-6" nth={1}>
    <span class="text-lg font-semibold my-4">Yay!</span>
    <span class="font-medium mb-4">Click here to add a new tag<br /> Call it whatever you want.</span>
  </Popover>
{:else if $tutorialStep === 5}
  <Popover>
    <button class="hidden" id="hackybtn"></button>
    <span class="text-lg font-semibold my-4">To undo</span>
    <span class="font-semibold mb-4">
      Press <div class="kbd kbd-sm">{ctrlKey}</div>
      +
      <div class="kbd kbd-sm">z</div></span>
  </Popover>
{:else if $tutorialStep === 6}
  <Popover>
    <span class="text-lg font-semibold my-4">To redo</span>
    <span class="font-semibold my-4">
      Press <div class="kbd kbd-sm">{ctrlKey}</div>
      +
      <div class="kbd kbd-sm">shift</div>
      +
      <div class="kbd kbd-sm">z</div>
    </span>
    <span class=" mb-4">This means you can experiment a bit and change your mind quickly.</span>
  </Popover>
{:else if $tutorialStep === 7}
  <Popover arrow={true} className="items-stretch" nth={1} align="top">
    <span class="text-lg font-semibold my-4">More options!</span>
    <span class="font-semibold mb-4"> Right click the save to see them.</span>
    <span class="font-semibold mb-4"> & Click on a star to pin this save.</span>
  </Popover>
{:else if $tutorialStep === 8}
  <Popover>
    <span class="text-lg font-semibold my-4">Starred saves will always be at the top</span>
    <span class="font-semibold mb-4">Likewise, archived saves will always be at the bottom.</span>
    <button
      class="btn btn-primary mb-4 mx-1"
      on:click={() => {
        tutorialStep.set(9)
        // @ts-ignore
        document.querySelector(".tooltip-bottom>button").click()
      }}>Next</button>
  </Popover>
{:else if $tutorialStep === 9}
  <Popover>
    <span class="text-lg font-semibold my-4">Nested tags</span>
    <span class="font-semibold mb-4"> They combine the best of tags and folders.</span>
    <span class="font-semibold mb-4"
      >They need to be written in the format <span class="kbd">parent/child</span>.</span>
    <button class="btn btn-primary mb-4 mx-1" on:click={() => tutorialStep.set(10)}>Next</button>
  </Popover>
{:else if $tutorialStep === 10}
  <Popover arrow={true} className="min-h-6" nth={1} align="top">
    <span class="text-lg font-semibold my-4">Create one here</span>
    <span class="font-semibold mb-4">Let's call it <span class="kbd">art/music</span>. </span>
  </Popover>
{:else if $tutorialStep === 11}
  <Popover arrow={true} className="expander-parent" text="art" align="left">
    <span class="text-lg font-semibold my-4">Yeah!</span>
    <span class="font-semibold mb-4"> Now clicking the tag will expand to show its children.</span>
  </Popover>
{:else if $tutorialStep === "toggle all"}
  <Popover arrow={true} className="tooltip-bottom" text="" align="left">
    <span class="text-lg font-semibold my-4">To revert</span>
    <span class="font-semibold mb-4"> Click the toggle-all button.</span>
  </Popover>
{:else if $tutorialStep === 12}
  <Popover arrow={true} className="mb-2" text="Sites" align="top">
    <span class="text-lg font-semibold my-4">Browse them by sites</span>
    <span class="font-semibold mb-4">By expanding here </span>
  </Popover>
{:else if $tutorialStep === 13}
  <Popover arrow={true} className="max-w-xs" text="" align="top">
    <span class="text-lg font-semibold my-4">And by text here</span>
    <span class="font-semibold mb-4">Try typing <span class="font-mono">dim</span> for dimension.</span>
  </Popover>
{:else if $tutorialStep === 14}
  <Popover>
    <span class="text-lg font-semibold my-4">That's it!</span>
    <span class="font-semibold mb-4"> I hope you found this useful. </span>
    {#if !$hasExtensionStore}
      <a
        id="farogetitlink"
        class="btn btn-primary max-w-[19rem] my-2"
        target="_blank"
        data-umami-event="WebStore-Example"
        href="https://chromewebstore.google.com/detail/faros/pdndbnolgapjdcebajmgcehndggfegeo">
        <IconLogosChromeWebStore font-size="32" />Install the extension</a>
    {/if}
  </Popover>
{/if}
