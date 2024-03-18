<script lang="ts">
  import type { MouseEventHandler } from "svelte/elements"
  import type { Notes } from "./db/types"
  import type { NoteSync } from "./note-sync"
  import { option as O, array as A, readonlyArray as RA } from "fp-ts"
  import { onMount } from "svelte"
  import { escapeHTML, replacer, sleep, themeStore } from "./utils"
  import { MyTags, type NoteEx, type SourceData } from "./index"
  import { identity, pipe } from "fp-ts/lib/function"
  import fuzzysort from "fuzzysort"
  export let note_data: Omit<NoteEx, keyof SourceData>
  export let isOpen: boolean
  export let closeAll: () => void
  export let note_sync: NoteSync

  export let goto_function: MouseEventHandler<any> | undefined
  export let deleteCbOpt: O.Option<() => any> = O.none

  // type OptionValueType<T> = T extends O.Option<infer R> ? R : never

  let this_element: Element
  $: tags = note_data.tags || []
  let all_tags = note_sync.alltags

  $: text = pipe(
    note_data.searchArt,
    O.match(
      () => {
        const escaped = escapeHTML(note_data.quote)
        return !!note_data.highlights ? escaped.replace(note_data.highlights[0], $replacer) : escaped
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
  //.replace(note_data.quote, quoteBoldReplace)

  $: onTagAdded = note_sync.tagUpdate(note_data)
  $: onTagRemoved = note_sync.tagUpdate(note_data)

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

  let myModal: HTMLDialogElement | null = null
  let modalPotential = false
  let modalText = ""
  const loadModalText = () =>
    (modalText = note_data.highlights
      ? escapeHTML(note_data.context || "").replaceAll(note_data.highlights[0], $replacer)
      : escapeHTML(note_data.context || ""))
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- on:mouseenter={loadModalText} -->
<div
  class="collapse bg-base-200 border-primary"
  on:mouseenter={() => (modalPotential = true)}
  on:contextmenu|preventDefault={() => {
    if (myModal) myModal.showModal()
    loadModalText()
  }}
  style="border-width: {1 + 5 * +highlighting}px; position: static;">
  <input type="checkbox" class="-z-10" bind:checked={isOpen} />
  <div
    class="collapse-title text-center"
    bind:this={this_element}
    style="font-size: 0.95rem; padding: 0.5rem; grid-column-start:1; position: static;">
    <button
      on:click={async () => {
        const save_showing_content = isOpen
        closeAll()
        // svelte stores....
        await sleep(1)
        isOpen = !save_showing_content
      }}
      on:dblclick={goto_function}>
      {@html text}
    </button>
    <span>
      <MyTags tags={[...tags]} autoComplete={$all_tags} {onTagAdded} {onTagRemoved} />
      <!-- <div class="flex justify-center">
          <div class="py-4 border-2 border-red-600">
            lil cont
            <div style="position:absolute; z-index:50">
              pop<br />pop<br />pop<br />pop
            </div>
          </div>
        </div> -->
    </span>
  </div>
  <div class="collapse-content z-40" style="grid-row-start: 2">
    <div class="join w-full">
      <!-- <button class="btn btn-xs join-item grow" on:click={() => {}}>
        Pin / Unpin</button> -->
      <button
        class="btn btn-xs join-item grow"
        style="color: red;"
        on:click={() => {
          note_sync.deleteit(note_data)
          // prettier-ignore
          pipe(deleteCbOpt, O.map((f) => f()))
          closeAll()
        }}>DELETE</button>
    </div>
  </div>
  {#if modalPotential}
    <dialog id="my_modal_2" class="modal" bind:this={myModal}>
      <div class="modal-box">
        <!-- <h3 class="font-bold text-lg">{note_data}</h3> -->
        <p class="py-4">
          {@html note_data.highlights
            ? escapeHTML(note_data.context || "").replaceAll(note_data.highlights[0], $replacer)
            : escapeHTML(note_data.context || "")}
        </p>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  {/if}
</div>
