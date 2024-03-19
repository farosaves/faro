<script lang="ts">
  // import { Icon, CheckCircle, XCircle, ArchiveBoxXMark } from "svelte-hero-icons"
  // import { IconCheckbox, IconTagOff } from "@tabler/icons-svelte"

  import { identity, pipe } from "fp-ts/lib/function"
  import { array as A, record as R, nonEmptyArray as NA, option as O } from "fp-ts"
  import { desc, type NoteEx, type NoteSync } from "shared"
  import { derived, writable } from "svelte/store"
  import { currTagSet, exclTagSets as t, tagFilter } from "$lib/filterSortStores"
  export let note_sync: NoteSync
  let notestore = note_sync.notestore
  const tags_counts = derived(notestore, (x) =>
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
</script>

<!-- <div
  class="bg-base-100 sticky grid grid-flow-col top-0 z-20 justify-center overflow-x-auto overflow-y-hidden"> -->
<div class="bg-base-100 sticky top-0 z-20 carousel w-[99%]">
  <div class="tooltip tooltip-right tooltip-primary carousel-item" data-tip="toggle all">
    <button
      class="btn btn-neutral btn-sm text-nowrap"
      on:click={checkClick}
      class:btn-outline={currTagSet($t).size == $tags_counts.length}>
      <!-- <IconCheckbox size="26" /> -->
      ico1
    </button>
  </div>
  {#each $tags_counts as [tag, cnt]}
    <div class="tooltip tooltip-right tooltip-primary carousel-item" data-tip={tag ? cnt : `${cnt} untagged`}>
      <button
        class="btn btn-neutral btn-sm text-nowrap"
        on:click={() => toggleSet(tag)}
        class:btn-outline={currTagSet($t).has(tag)}
        >{#if tag}{tag}{:else}
          ico2
          <!-- <IconTagOff size="26" /> -->

          <!-- <Icon size="26" src={ArchiveBoxXMark} /> -->
        {/if}
      </button>
    </div>
  {/each}
</div>
