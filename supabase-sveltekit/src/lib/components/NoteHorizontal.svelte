<script lang="ts">
  import { type NoteEx } from "shared"
  export let note_data: NoteEx
  export let showing_content: boolean | undefined
  import type { NoteSync } from "shared"
  export let note_sync: NoteSync

  let goto_function = async () => {
    const url = note_data.sources.url
    console.log(url)
    url && open(url)
  }

  import { sleep, themeStore } from "shared"
  import { MyTags } from "shared"
  import { option as O } from "fp-ts"
  import { onMount } from "svelte"
  import { pipe } from "fp-ts/lib/function"
  export let close_all_notes: () => void

  export let deleteCbOpt: O.Option<() => any> = O.none

  // type OptionValueType<T> = T extends O.Option<infer R> ? R : never

  let this_element: Element
  $: tags = note_data.tags || []
  let all_tags = note_sync.alltags()
  $: replacer = (capture: string) =>
    `<b class="${$themeStore == "dark" ? "text-yellow-100" : ""}">` + capture + `</b>`
  // const quoteBoldReplace = (capture: string) => `<b>${capture}</b>`
  let escapeHTML = (text: string) => {
    var div = document.createElement("div")
    div.innerText = text
    return div.innerHTML
  }

  $: text = note_data.highlights
    ? escapeHTML(note_data.quote).replaceAll(note_data.highlights[0], replacer)
    : escapeHTML(note_data.quote)
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
      ? escapeHTML(note_data.context || "").replaceAll(note_data.highlights[0], replacer)
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
  style="border-width: {1 + 5 * +highlighting}px;">
  <input type="checkbox" class="-z-10" bind:checked={showing_content} />
  <div
    class="collapse-title text-center"
    bind:this={this_element}
    style="font-size: 0.95rem; padding: 0.5rem; grid-column-start:1">
    <button
      on:click={async () => {
        const save_showing_content = showing_content
        close_all_notes()
        // svelte stores....
        await sleep(1)
        showing_content = !save_showing_content
      }}
      on:dblclick={goto_function}>
      {@html text}
    </button>
    <span>
      <MyTags bind:tags autoComplete={$all_tags} {onTagAdded} {onTagRemoved} />
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
          close_all_notes()
        }}>DELETE</button>
    </div>
  </div>
  {#if modalPotential}
    <dialog id="my_modal_2" class="modal" bind:this={myModal}>
      <div class="modal-box">
        <!-- <h3 class="font-bold text-lg">{note_data}</h3> -->
        <p class="py-4">
          {@html note_data.highlights
            ? escapeHTML(note_data.context || "").replaceAll(note_data.highlights[0], replacer)
            : escapeHTML(note_data.context || "")}
        </p>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  {/if}
</div>
