<script lang="ts">
  import type { MouseEventHandler } from "svelte/elements"

  import type { SyncLike } from "./sync/sync"
  import { option as O, array as A, predicate } from "fp-ts"
  import { ctrlKey, escapeHTML, sleep, replacer } from "./utils"
  import { modalOpenStore, modalNote, toastNotify, windowActive } from "./stores"
  import { MyTags, shortcut, type NoteEx, type SourceData } from "./index"
  import { pipe } from "fp-ts/lib/function"
  import IconTrash from "~icons/tabler/trash"
  import IconLink from "~icons/tabler/link"
  import IconDotsVertical from "~icons/tabler/dots-vertical"
  import StarArchive from "./StarArchive.svelte"
  import type { Readable } from "svelte/motion"
  import fuzzysort from "fuzzysort"
  export let note_data: Omit<NoteEx, keyof SourceData>
  export let isOpen: boolean
  export let closeAll: () => void
  export let syncLike: SyncLike
  export let allTags: Readable<string[]>
  export let px: number | undefined = undefined
  export let mr = false

  export let goto_function: MouseEventHandler<any> | undefined
  export let deleteCbOpt: O.Option<() => any> = O.none
  export let isHighlighted = false

  // type OptionValueType<T> = T extends O.Option<infer R> ? R : never

  let this_element: Element
  $: tags = note_data.tags || []

  const replaceAll = (escaped: string, replacer: (c: string) => string) => {
    for (const hl of note_data.highlights) escaped = escaped.replace(hl, replacer)
    return escaped
  }
  $: [a1, b1] = escapeHTML(replacer("split")).split("split")
  $: [a2, b2] = replacer("split").split("split")

  $: text = pipe(
    note_data.searchArt,
    O.match(
      () => {
        const escaped = escapeHTML(note_data.quote)
        return note_data.highlights ? replaceAll(escaped, replacer) : escaped
      }, // only replace quote
      ({ selectedKeys, optKR }) =>
        pipe(
          selectedKeys,
          A.findIndex((n) => n == "quote"),
          O.chain((i) => O.fromNullable(optKR[i])), // here I check that quote has a highlight
          O.map(
            (r) =>
              escapeHTML(fuzzysort.highlight(r, replacer)?.join("") || "")
                .replaceAll(a1, a2)
                .replaceAll(b1, b2) || undefined,
          ),

          O.chain(O.fromNullable),
          O.getOrElse(() => escapeHTML(note_data.quote)),
        ),
    ),
  )
  // .replace(note_data.quote, quoteBoldReplace)

  const onTagsChange = (tags: string[]) => syncLike.tagChange(note_data.id)(tags)
  // const onTagRemoved = (_: string, tags: string[]) => syncLike.tagChange(note_data.id)(tags)
  const changeP = syncLike.changePrioritised(note_data.id)

  const openOptions = async () => {
    const saveIsOpen = isOpen
    closeAll()
    await sleep(1)
    isOpen = !saveIsOpen
  }

  // let highlighting = false
  // const highlightMe = () => {
  //   this_element.scrollIntoView({ block: "center" })
  //   highlighting = true
  //   setTimeout(() => (highlighting = false), 1000)
  //   return true
  // }
  // onMount(() => {
  //   "highlightOnMount" in note_data &&
  //     note_data["highlightOnMount"] &&
  //     highlightMe() &&
  //     (note_data["highlightOnMount"] = false)
  // })
  const showOptions = () => {
    $modalNote = O.some(note_data)
    $modalOpenStore = true
  }
  let hovered = false
  // const cls = wRem ? `md:max-w-[${wRem * 4}] md:min-w-[${wRem * 4}]` : "" // this actually made the layout interesting
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- class:p-0={hovered && $windowActive}border p-[1px]
  class:border-2={hovered && $windowActive} -->
<div class="relative p-1" style={px ? `max-width: ${px}px; min-width: ${px}px` : ""} class:sm:mr-3={mr}>
  <div
    class="collapse bg-base-100 border-primary"
    style="border-width: {1 + +(hovered && $windowActive) + 2 * +isHighlighted}px;
     padding: {+!((hovered && $windowActive) || isHighlighted)}px"
    on:mouseenter={() => (hovered = true)}
    on:mouseleave={() => {
      hovered = false
      isOpen = false
    }}>
    <input type="checkbox" class="-z-10" bind:checked={isOpen} />
    <div
      class="collapse-title overflow-hidden text-center"
      bind:this={this_element}
      style="font-size: 0.95rem; padding: 0.5rem; grid-column-start:1; position: static;"
      on:contextmenu|preventDefault={openOptions}>
      <button on:click={goto_function} title="Right click for more options">
        <!-- class="h-16 text-ellipsis" -->
        <!-- class:overflow-hidden={!isOpen} omg :( -->
        {@html text}
      </button>
      <MyTags {tags} autoComplete={$allTags} {onTagsChange} />
    </div>
    <div class="collapse-content z-40">
      {#if hovered || isOpen}
        <!--  -->
        <StarArchive bind:hovered bind:p={note_data.prioritised} {changeP}>
          <button
            on:click={() => {
              if (hovered) {
                navigator.clipboard.writeText(import.meta.env.VITE_PI_IP + "/" + note_data.id)
                toastNotify("Copied to clipboard.")
              }
            }}
            class="tooltip tooltip-secondary"
            data-tip="Copy link {ctrlKey}+C"
            data-umami-event="Note Copy"
            use:shortcut={{ control: true, code: "KeyC" }}><IconLink /></button>

          <button
            class="tooltip tooltip-secondary text-error"
            data-tip="Delete"
            data-umami-event="Note Del"
            on:click={() => {
              syncLike.deleteit(note_data.id)
              // prettier-ignore
              pipe(deleteCbOpt, O.map(f => f()))
              closeAll()
            }}><IconTrash /></button>

          <button class="tooltip tooltip-secondary" data-tip="More info..." on:click={showOptions}
            ><IconDotsVertical /></button>
        </StarArchive>
      {/if}
    </div>
    {#if !isOpen}
      <button
        class="tooltip tooltip-secondary"
        on:click={openOptions}
        on:contextmenu|preventDefault={openOptions}
        data-tip="More options... (right click)">
        <div class="h-1 bg-neutral mb-1 mx-5 rounded-sm"></div>
      </button>
    {/if}
  </div>
</div>

<!-- <style>
  .highlighting {
    border-width: 5px;
  }
</style> -->
