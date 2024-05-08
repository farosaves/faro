<script lang="ts">
  // import { Icon, CheckCircle, XCircle, ArchiveBoxXMark } from "svelte-hero-icons"
  // import { IconCheckbox, IconTagOff } from "@tabler/icons-svelte"
  import IconCheckbox from "~icons/tabler/checkbox"
  import IconTagOff from "~icons/tabler/tag-off"

  import { flow } from "fp-ts/lib/function"
  import { array as A, set as S, option as O, either as E, string as Str } from "fp-ts"
  import { NoteDeri, tagModalOpenStore } from "shared"
  import { derived } from "svelte/store"
  import { exclTagSet, exclTagSets, twoPlusTags } from "../filterSortStores"
  import { getGroupTagCounts } from "./tagViewStores"
  import Search from "./Search.svelte"

  export let noteDeri: NoteDeri
  // let noteStore = note_sync.noteStore
  const tagsCounts = getGroupTagCounts(noteDeri)
  const pureTags = derived(tagsCounts, flow(A.map(E.swap), A.map(O.fromEither), A.compact))
  const tagGroups = derived(tagsCounts, flow(A.map(O.fromEither), A.compact))
  const untagged = derived(
    tagsCounts,
    flow(
      A.map(E.toUnion),
      A.findFirst((x) => x[0] == ""),
      O.map((x) => x[1]),
      O.getOrElse(() => 0),
    ),
  )
  const allTags = derived(noteDeri.allTags, A.append(""))
  // const allExcl = derived(exclTagSet, (s) => (s.size ? A.every(s.has) : (_a: any) => false))
  const allExcl = derived(exclTagSet, (s) => A.reduce(true, (prev, a: string) => prev && s.has(a)))

  const checkClick = () => {
    // assigns to trigger potential $:
    if ($exclTagSet.size > 0) $exclTagSets.sets[$exclTagSets.currId] = new Set()
    else $exclTagSets.sets[$exclTagSets.currId] = new Set($allTags)
  }
  // $: console.log(Array.from($exclTagSets.sets[$exclTagSets.currId]))
  const toggleTag = (tag: string) =>
    exclTagSets.update((s) => {
      s.sets[s.currId].delete(tag) || s.sets[s.currId].add(tag)
      return s
    })
  const toggleTagGroup = (tags: string[]) =>
    exclTagSets.update((s) => {
      if (S.intersection(Str.Eq)(s.sets[s.currId])(new Set(tags)).size)
        for (const tag of tags) s.sets[s.currId].delete(tag)
      else for (const tag of tags) s.sets[s.currId].add(tag)
      // s.sets[s.currId].delete(tag) || s.sets[s.currId].add(tag)
      return s
    })
  const onDblClick = (tag: string) => () => {
    $exclTagSets.sets[$exclTagSets.currId] = new Set($allTags)
    toggleTag(tag)
  }
  const onDblClickGroup = (tags: string[]) => () => {
    $exclTagSets.sets[$exclTagSets.currId] = new Set($allTags)
    toggleTagGroup(tags)
  }
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
  let dropdownOpen = false
  let hRem = 2
  // window.yo = () => (dropdownOpen = !dropdownOpen)
</script>

<div class="bg-base-200 sticky top-0 z-20 carousel w-[99%]" style="height: {hRem}rem">
  <div class="tooltip tooltip-right tooltip-secondary carousel-item" data-tip="toggle all">
    <details class="dropdown" bind:open={dropdownOpen}>
      <summary
        class="btn btn-neutral btn-sm text-nowrap"
        on:click|preventDefault={checkClick}
        class:btn-outline={$exclTagSet.size}>
        <!-- <button -->
        <IconCheckbox />
        <!-- </button> -->
      </summary>
      <ul class="p-2 shadow menu dropdown-content z-[1] bg-base-100 rounded-box w-52">
        <li>yo</li>
        <li>ya</li>
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
  {#each $tagGroups.filter((x) => x[0].length > 0) as [tag, cnt, tss]}
    {@const ts = tss.map((t) => t[0])}
    <div class="tooltip tooltip-right tooltip-secondary carousel-item" data-tip={cnt}>
      <button
        class="btn btn-neutral btn-sm text-nowrap"
        on:click={() => toggleTagGroup(ts)}
        on:contextmenu|preventDefault={onContextMenu(tag)}
        on:dblclick={onDblClickGroup(ts)}
        class:btn-outline={$allExcl(ts)}
        >{tag}/
      </button>
    </div>
  {/each}
  {#each $pureTags.filter((x) => x[0].length > 0) as [tag, cnt]}
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
