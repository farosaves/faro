<script lang="ts">
  import type { MouseEventHandler } from "svelte/elements"

  import type { SyncLike } from "./sync/sync"
  import { option as O, array as A } from "fp-ts"
  import { onMount } from "svelte"
  import { escapeHTML, sleep } from "./utils"
  import { modalOpenStore, modalNote, replacer, toastNotify } from "./stores"
  import { MyTags, shortcut, type NoteEx, type SourceData } from "./index"
  import { pipe } from "fp-ts/lib/function"
  import fuzzysort from "fuzzysort"
  import StarArchive from "./StarArchive.svelte"
  import type { Readable } from "svelte/motion"
  export let note_data: Omit<NoteEx, keyof SourceData>
  export let isOpen: boolean
  export let closeAll: () => void
  export let syncLike: SyncLike
  export let allTags: Readable<string[]>

  export let goto_function: MouseEventHandler<any> | undefined
  export let deleteCbOpt: O.Option<() => any> = O.none

  // type OptionValueType<T> = T extends O.Option<infer R> ? R : never

  let this_element: Element
  $: tags = note_data.tags || []

  const replaceAll = (escaped: string, replacer: (c: string) => string) => {
    for (const hl of note_data.highlights) escaped = escaped.replace(hl, $replacer)
    return escaped
  }

  $: text = pipe(
    note_data.searchArt,
    O.match(
      () => {
        const escaped = escapeHTML(note_data.quote)
        return note_data.highlights ? replaceAll(escaped, $replacer) : escaped
      }, // only replace quote
      ({ selectedKeys, optKR }) =>
        pipe(
          selectedKeys,
          A.findIndex((n) => n == "quote"),
          O.chain((i) => O.fromNullable(optKR[i])), // here I check that quote has a highlight
          O.map((r) => {
            const target = escapeHTML(r.target)
            return fuzzysort.highlight({ ...r, target }, $replacer)?.join("")
          }),
          O.chain(O.fromNullable),
          O.getOrElse(() => escapeHTML(note_data.quote)),
        ),
    ),
  )
  // .replace(note_data.quote, quoteBoldReplace)

  $: onTagAdded = (_: string, tags: string[]) => syncLike.tagChange(note_data.id)(tags)
  $: onTagRemoved = (_: string, tags: string[]) => syncLike.tagChange(note_data.id)(tags)
  $: changeP = syncLike.changePrioritised(note_data.id)

  let highlighting = false
  const highlightMe = () => {
    this_element.scrollIntoView({ block: "center" })
    highlighting = true
    setTimeout(() => (highlighting = false), 1000)
    return true
  }
  onMount(() => {
    "highlightOnMount" in note_data &&
      note_data["highlightOnMount"] &&
      highlightMe() &&
      (note_data["highlightOnMount"] = false)
  })

  let hovered = false
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  class="collapse bg-base-200 border-primary border hover:border-2 p-[1px] hover:p-0"
  on:mouseenter={() => (hovered = true)}
  on:mouseleave={() => {
    hovered = false
    isOpen = false
  }}
  class:highlighting
  on:contextmenu|preventDefault={() => {
    $modalNote = O.some(note_data)
    $modalOpenStore = true
  }}>
  <input type="checkbox" class="-z-10" bind:checked={isOpen} />
  <div
    class="collapse-title text-center"
    bind:this={this_element}
    style="font-size: 0.95rem; padding: 0.5rem; grid-column-start:1; position: static;">
    <button
      on:click={async () => {
        const saveIsOpen = isOpen
        closeAll()
        await sleep(1)
        isOpen = !saveIsOpen
      }}
      on:dblclick={goto_function}>
      {@html text}
    </button>
    <MyTags tags={[...tags]} autoComplete={$allTags} {onTagAdded} {onTagRemoved} />
  </div>
  <div class="collapse-content z-40" style="grid-row-start: 2">
    <div class="join w-full">
      <!-- <button class="btn btn-xs join-item grow" on:click={() => {}}>
        Pin / Unpin</button> -->
      {#if hovered}
        <StarArchive bind:hovered bind:p={note_data.prioritised} {changeP}>
          <button
            class="btn btn-xs text-error"
            on:click={() => {
              syncLike.deleteit(note_data.id)
              // prettier-ignore
              pipe(deleteCbOpt, O.map(f => f()))
              closeAll()
            }}>DELETE</button>
        </StarArchive>
      {/if}
    </div>
  </div>
  <button
    hidden
    on:click={() => {
      if (hovered) {
        navigator.clipboard.writeText(import.meta.env.VITE_PI_IP + "/notes/" + note_data.id)
        toastNotify("Copied to clipboard.")
      }
    }}
    use:shortcut={{ control: true, code: "KeyC" }} />
</div>

<style>
  .highlighting {
    border-width: 5px;
  }
</style>
