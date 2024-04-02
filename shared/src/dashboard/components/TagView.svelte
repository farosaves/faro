<script lang="ts">
  // import { Icon, CheckCircle, XCircle, ArchiveBoxXMark } from "svelte-hero-icons"
  // import { IconCheckbox, IconTagOff } from "@tabler/icons-svelte"
  import IconCheckbox from "~icons/tabler/checkbox"
  import IconTagOff from "~icons/tabler/tag-off"

  import { identity, pipe } from "fp-ts/lib/function"
  import { array as A, record as R, nonEmptyArray as NA, option as O, map as M, string as S } from "fp-ts"
  import { desc, type NoteEx, type NoteSync } from "shared"
  import { derived, writable } from "svelte/store"
  import { exclTagSet, exclTagSets, tagFilter } from "../filterSortStores"
  import { modalOpenStore } from "shared"
  export let note_sync: NoteSync
  let noteStore = note_sync.noteStore
  const tags_counts = derived(noteStore, (x) =>
    pipe(
      [...x.values()],
      A.flatMap((note) => note.tags || []),
      NA.groupBy(identity),
      R.map((x) => x.length),
      R.toArray,
    )
      .concat(
        // prettier-ignore
        [["", pipe(x, M.filter(note => !note.tags.length), M.size)]],
      )
      .toSorted(desc(([x, y]) => y)),
  )

  $: console.log(!!$tagFilter, "tagFilter updated")
  const checkClick = () => {
    // assigns to trigger potential $:
    if ($exclTagSet.size > 0) $exclTagSets.sets[$exclTagSets.currId] = new Set()
    else $exclTagSets.sets[$exclTagSets.currId] = new Set($tags_counts.map(([x, y]) => x))
  }
  $: console.log(Array.from($exclTagSets.sets[$exclTagSets.currId]))
  const toggleSet = (tag: string) =>
    exclTagSets.update((s) => {
      s.sets[s.currId].delete(tag) || s.sets[s.currId].add(tag)
      return s
    })

  // let modalPotential: boolean
  let myModal: HTMLDialogElement | null = null
  let currTag: string
  let newTag: string
  const updateTag = () => {
    note_sync.tagUpdate(currTag, O.some(newTag))
    currTag = newTag
    return true
  }
  const onDblClick = (tag: string) => () => {
    if (myModal) {
      currTag = newTag = tag
      myModal.showModal()
      $modalOpenStore = true
    }
  }
  const deleteTag = () => {
    myModal && myModal.close()
    note_sync.tagUpdate(currTag, O.none)
  }
</script>

<div class="bg-base-100 sticky top-0 z-20 carousel w-[99%]">
  <div class="tooltip tooltip-right tooltip-secondary carousel-item" data-tip="toggle all">
    <button
      class="btn btn-neutral btn-sm text-nowrap"
      on:click={checkClick}
      class:btn-outline={$exclTagSet.size == $tags_counts.length}>
      <IconCheckbox />
    </button>
  </div>
  {#each $tags_counts as [tag, cnt]}
    <div
      class="tooltip tooltip-right tooltip-secondary carousel-item"
      data-tip={tag ? cnt : `${cnt} untagged`}>
      <button
        class="btn btn-neutral btn-sm text-nowrap"
        on:click={() => toggleSet(tag)}
        on:contextmenu|preventDefault={onDblClick(tag)}
        class:btn-outline={$exclTagSet.has(tag)}
        >{#if tag}{tag}{:else}
          <IconTagOff />
        {/if}
      </button>
    </div>
  {/each}
</div>

<dialog class="modal" bind:this={myModal} on:close={() => ($modalOpenStore = false)}>
  <div class="modal-box flex flex-col border-2 items-center">
    <button
      class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
      on:click={() => myModal && myModal.close()}>✕</button>
    <p class="py-2 text-center">Rename this tag:<br /> {currTag}</p>
    <form class=" ">
      <input class="input input-bordered text-center" type="text" bind:value={newTag} />
      <button hidden on:click={updateTag} />
    </form>
    <button class="btn text-error mt-2" on:click={deleteTag}>delete</button>
    <!-- on:click={() => newTag && updateTag(currTag, newTag) && (currTag = newTag) && console.log("aa")} -->
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
