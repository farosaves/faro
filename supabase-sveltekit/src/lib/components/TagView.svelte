<script lang="ts">
  // import { Icon, CheckCircle, XCircle, ArchiveBoxXMark } from "svelte-hero-icons"
  // import { IconCheckbox, IconTagOff } from "@tabler/icons-svelte"
  import IconCheckbox from "~icons/tabler/checkbox"
  import IconTagOff from "~icons/tabler/tag-off"

  import { identity, pipe } from "fp-ts/lib/function"
  import { array as A, record as R, nonEmptyArray as NA, option as O } from "fp-ts"
  import { desc, type NoteEx, type NoteSync } from "shared"
  import { derived, writable } from "svelte/store"
  import { currTagSet, exclTagSets as t, tagFilter } from "$lib/filterSortStores"
  import { modalOpenStore } from "shared"
  export let note_sync: NoteSync
  let noteStore = note_sync.noteStore
  const tags_counts = derived(noteStore, (x) =>
    pipe(
      Object.values(x),
      A.flatMap((note) => note.tags || []),
      NA.groupBy(identity),
      R.map((x) => x.length),
      R.toArray,
    )
      .concat(
        // prettier-ignore
        [["", pipe(x, R.filter((note) => !note.tags.length), R.size)]],
      )
      .toSorted(desc(([x, y]) => y)),
  )

  $: console.log(!!$tagFilter, "tagFilter updated")
  const checkClick = () => {
    // assigns to trigger potential $:
    if (currTagSet($t).size > 0) $t.ss[$t.ui] = new Set()
    else $t.ss[$t.ui] = new Set($tags_counts.map(([x, y]) => x))
  }
  $: console.log(Array.from($t.ss[$t.ui]))
  const toggleSet = (tag: string) =>
    t.update((s) => {
      currTagSet(s).delete(tag) || currTagSet(s).add(tag)
      return s
    })

  // let modalPotential: boolean
  const updateTag = (oldTag: string, newTag: string) => {
    return true
  }
  let myModal: HTMLDialogElement | null = null
  let currTag: string
  let newTag: string
  const onDblClick = (tag: string) => () => {
    if (myModal) {
      currTag = newTag = tag
      myModal.showModal()
      $modalOpenStore = true
    }
  }
</script>

<!-- <div
  class="bg-base-100 sticky grid grid-flow-col top-0 z-20 justify-center overflow-x-auto overflow-y-hidden"> -->

<!-- on:mouseenter={() => (modalPotential = true)}
  on:mouseleave={() => (modalPotential = false)} -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="bg-base-100 sticky top-0 z-20 carousel w-[99%]">
  <!-- {modalPotential} -->
  <div class="tooltip tooltip-right tooltip-primary carousel-item" data-tip="toggle all">
    <button
      class="btn btn-neutral btn-sm text-nowrap"
      on:click={checkClick}
      class:btn-outline={currTagSet($t).size == $tags_counts.length}>
      <!-- <IconCheckbox size="26" /> -->
      <IconCheckbox />
    </button>
  </div>
  {#each $tags_counts as [tag, cnt]}
    <div class="tooltip tooltip-right tooltip-primary carousel-item" data-tip={tag ? cnt : `${cnt} untagged`}>
      <button
        class="btn btn-neutral btn-sm text-nowrap"
        on:click={() => toggleSet(tag)}
        on:contextmenu={onDblClick(tag)}
        class:btn-outline={currTagSet($t).has(tag)}
        >{#if tag}{tag}{:else}
          <IconTagOff />
          <!-- <IconTagOff size="26" /> -->

          <!-- <Icon size="26" src={ArchiveBoxXMark} /> -->
        {/if}
      </button>
    </div>
  {/each}
</div>

<dialog class="modal" bind:this={myModal} on:close={() => ($modalOpenStore = false)}>
  <div class="modal-box">
    <button
      class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
      on:click={() => myModal && myModal.close()}>✕</button>
    <form class="flex flex-col border-2 items-center">
      <p class="py-2 text-center">Rename this tag:<br /> {currTag}</p>
      <input class="input input-bordered text-center" type="text" bind:value={newTag} />
      <button hidden on:click={() => console.log("aa")} />
      <button class="btn text-error mt-2">delete</button>
    </form>
    <!-- on:click={() => newTag && updateTag(currTag, newTag) && (currTag = newTag) && console.log("aa")} -->
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
