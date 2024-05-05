<script lang="ts">
  // import { Icon, CheckCircle, XCircle, ArchiveBoxXMark } from "svelte-hero-icons"
  // import { IconCheckbox, IconTagOff } from "@tabler/icons-svelte"
  import IconCheckbox from "~icons/tabler/checkbox"
  import IconTagOff from "~icons/tabler/tag-off"

  import { flow, identity, pipe } from "fp-ts/lib/function"
  import { array as A, record as R, nonEmptyArray as NA, option as O, tuple as T } from "fp-ts"
  import { desc, NoteDeri, tagModalOpenStore } from "shared"
  import { derived } from "svelte/store"
  import { exclTagSet, exclTagSets, twoPlusTags } from "../filterSortStores"
  export let noteDeri: NoteDeri
  // let noteStore = note_sync.noteStore
  const tags_counts = derived(noteDeri.noteArr, (x) =>
    pipe(
      x,
      A.flatMap((note) => note.tags || []),
      NA.groupBy(identity),
      R.map((x) => x.length),
      R.toArray,
    )
      .concat(
        // prettier-ignore
        [["", pipe(x, A.filter(note => !note.tags.length), A.size)]],
      )
      .toSorted(desc(([x, y]) => y)),
  )
  const untagged = derived(
    tags_counts,
    flow(
      A.findFirst((x) => x[0] == ""),
      O.map(T.snd),
      O.getOrElse(() => 0),
    ),
  )

  // $: console.log(!!$tagFilter, "tagFilter updated")
  const checkClick = () => {
    // assigns to trigger potential $:
    if ($exclTagSet.size > 0) $exclTagSets.sets[$exclTagSets.currId] = new Set()
    else $exclTagSets.sets[$exclTagSets.currId] = new Set($tags_counts.map(([x, y]) => x))
  }
  // $: console.log(Array.from($exclTagSets.sets[$exclTagSets.currId]))
  const toggleTag = (tag: string) =>
    exclTagSets.update((s) => {
      s.sets[s.currId].delete(tag) || s.sets[s.currId].add(tag)
      return s
    })
  const onDblClick = (tag: string) => () =>
    ($exclTagSets.sets[$exclTagSets.currId] = new Set(
      $tags_counts.map(([x, y]) => x).filter((t) => t != tag),
    ))

  // let modalPotential: boolean
  let myModal: HTMLDialogElement | null = null
  let currTag: string
  let newTag: string
  const updateTag = () => {
    noteDeri.sync.tagUpdate(currTag, O.some(newTag))
    currTag = newTag
    return true
  }
  const onContextMenu = (tag: string) => () => {
    if (myModal) {
      // && tag.length
      currTag = newTag = tag
      myModal.showModal()
      $tagModalOpenStore = true
    }
  }
  const deleteTag = () => {
    myModal && myModal.close()
    noteDeri.sync.tagUpdate(currTag, O.none)
  }
</script>

<div class="bg-base-100 sticky top-0 z-20 carousel w-[99%] overflow-y-hidden">
  <div class="tooltip tooltip-right tooltip-secondary carousel-item" data-tip="toggle all">
    <details class="dropdown">
      <summary>
        <button
          class="btn btn-neutral btn-sm text-nowrap"
          on:click={checkClick}
          class:btn-outline={$exclTagSet.size}>
          <IconCheckbox />
        </button>
      </summary>
      <ul class="p-2 shadow menu dropdown-content z-[1] bg-base-100 rounded-box w-52">
        <li><a>Item 1</a></li>
        <li><a>Item 2</a></li>
      </ul>
    </details>
  </div>

  <!-- <div class="tooltip tooltip-right tooltip-secondary carousel-item" data-tip="2+ tags">
    <button
      class="btn btn-neutral btn-sm text-nowrap"
      on:click={() => ($twoPlusTags = !$twoPlusTags)}
      class:btn-outline={!$twoPlusTags}>
      <IconCheckbox />
    </button>
  </div> -->
  {#if $untagged}
    <div class="tooltip tooltip-right tooltip-secondary carousel-item" data-tip={`${$untagged} untagged`}>
      <button
        class="btn btn-neutral btn-sm text-nowrap"
        on:click={() => toggleTag("")}
        on:dblclick={onDblClick("")}
        class:btn-outline={$exclTagSet.has("")}>
        <IconTagOff />
      </button>
    </div>
  {/if}
  {#each $tags_counts.filter((x) => x[0].length > 0) as [tag, cnt]}
    <div class="tooltip tooltip-right tooltip-secondary carousel-item" data-tip={cnt}>
      <button
        class="btn btn-neutral btn-sm text-nowrap"
        on:click={() => toggleTag(tag)}
        on:contextmenu|preventDefault={onContextMenu(tag)}
        on:dblclick={onDblClick(tag)}
        class:btn-outline={$exclTagSet.has(tag)}
        >{tag}
      </button>
    </div>
  {/each}
</div>

<dialog class="modal" bind:this={myModal} on:close={() => ($tagModalOpenStore = false)}>
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
