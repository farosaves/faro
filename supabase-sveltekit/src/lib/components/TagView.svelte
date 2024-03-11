<script lang="ts">
  import { Icon, CheckCircle, XCircle } from "svelte-hero-icons"
  import { identity, pipe } from "fp-ts/lib/function"
  import { array as A, record as R, nonEmptyArray as NA } from "fp-ts"
  import { desc, type NoteEx, type NoteSync } from "shared"
  import { derived, writable } from "svelte/store"
  export let tagFilter: (n: NoteEx & { priority: number }) => NoteEx & { priority: number } = identity
  export let note_sync: NoteSync
  let notestore = note_sync.notestore
  let exclTagSet = writable(new Set<string>([]))

  const tags_counts = derived(notestore, (x) =>
    pipe(
      x,
      A.flatMap((note) => note.tags || []),
      NA.groupBy(identity),
      R.map((x) => x.length),
      R.toArray,
    )
      .concat(
        // prettier-ignore
        [["", pipe(x, (A.filter((note) => !note.tags))).length]], // untagged
      )
      .toSorted(desc(([x, y]) => y)),
  )

  //if (exclTagSet.size)
  $: tagFilter = (n) => {
    return {
      ...n,
      priority: pipe(
        n.tags || [""], // here I handle "" for no tags, so my strange choice to use [""] as no tags for filter is contained to thids file lol
        A.map((s) => !$exclTagSet.has(s)),
        A.reduce(false, (x, y) => x || y),
      )
        ? n.priority
        : 0,
    }
  }
  $: console.log(!!tagFilter, "tagFilter updated")
  const checkClick = () => {
    // assigns to trigger potential $:
    if ($exclTagSet.size == $tags_counts.length) $exclTagSet = new Set()
    else $exclTagSet = new Set($tags_counts.map(([x, y]) => x))
  }
  $: console.log(Array.from($exclTagSet))
  const toggleSet = (tag: string) =>
    exclTagSet.update((s) => {
      s.delete(tag) || s.add(tag)
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
      class:btn-outline={$exclTagSet.size == $tags_counts.length}>
      <Icon src={CheckCircle} />
    </button>
  </div>
  {#each $tags_counts as [tag, cnt]}
    <div class="tooltip tooltip-right tooltip-primary carousel-item" data-tip={tag ? cnt : `${cnt} untagged`}>
      <button
        class="btn btn-neutral btn-sm text-nowrap"
        on:click={() => toggleSet(tag)}
        class:btn-outline={$exclTagSet.has(tag)}
        >{#if tag}{tag}{:else}
          <Icon src={XCircle} />
        {/if}
      </button>
    </div>
  {/each}
</div>
