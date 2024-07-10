<script lang="ts">
  // import { Icon, CheckCircle, XCircle, ArchiveBoxXMark } from "svelte-hero-icons"
  // import { IconCheckbox, IconTagOff } from "@tabler/icons-svelte"
  import IconCheckbox from "~icons/tabler/checkbox"
  import IconTagOff from "~icons/tabler/tag-off"
  import ChevronDown from "~icons/jam/chevron-down"
  import ChevronUp from "~icons/jam/chevron-up"

  import { flow, pipe } from "fp-ts/lib/function"
  import { array as A, set as S, option as O, either as E, string as Str } from "fp-ts"
  import { NoteDeri, asc, funLog, isCmd, sleep, tagModalOpenStore } from "$lib"
  import { derived, get, writable } from "svelte/store"
  import { exclTagSet, exclTagSets } from "../filterSortStores"
  exclTagSets.subscribe(funLog("exclTagSets"))
  import { getGroupTagCounts, groupize } from "./tagViewStores"
  import { onMount } from "svelte"
  import addTag from "$lib/assets/addTag.png"
  import addTag2 from "$lib/assets/addTag2.png"
  import { Effect, Schedule } from "effect"

  export let noteDeri: NoteDeri
  // let noteStore = note_sync.noteStore
  const tagsCounts = getGroupTagCounts(noteDeri)
  // const pureTags = derived(tagsCounts, flow(A.map(E.swap), A.map(O.fromEither), A.compact))
  // const tagGroups = derived(tagsCounts, flow(A.map(O.fromEither), A.compact))
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
  const excl = derived(exclTagSet, (s) =>
    groupize(
      (x) => s.has(x),
      A.some((a) => s.has(a)),
      // A.reduce(true, (prev, a: string) => prev && s.has(a)),
    ),
  )

  const checkClick = () => {
    if (location.hash) history.replaceState("", document.title, location.pathname + location.search)
    // location.href = location.href.replace(/#$/, "")
    if ($exclTagSet.size > 0) $exclTagSets.sets[$exclTagSets.currId] = new Set()
    else $exclTagSets.sets[$exclTagSets.currId] = new Set($allTags)
  }
  const _toggleTag = (tag: string) => {
    if (location.hash) history.replaceState("", document.title, location.pathname + location.search)
    // location.href = location.href.replace(/#$/, "")
    exclTagSets.update((s) => {
      s.sets[s.currId].delete(tag) || s.sets[s.currId].add(tag)
      return s
    })
  }
  const _toggleTagGroup = (tags: string[]) => {
    if (location.hash) history.replaceState("", document.title, location.pathname + location.search)
    // location.href = location.href.replace(/#$/, "")
    exclTagSets.update((s) => {
      if (S.intersection(Str.Eq)(s.sets[s.currId])(new Set(tags)).size)
        for (const tag of tags) s.sets[s.currId].delete(tag)
      else for (const tag of tags) s.sets[s.currId].add(tag)
      return s
    })
  }
  const toggle = groupize(_toggleTag, _toggleTagGroup)
  const _makeOnly = (tag: string) => {
    $exclTagSets.sets[$exclTagSets.currId] = new Set($allTags)
    _toggleTag(tag)
    location.hash = tag
  }
  const _makeOnlyGroup = (tags: string[]) => {
    $exclTagSets.sets[$exclTagSets.currId] = new Set($allTags)
    _toggleTagGroup(tags)
    const shortest = tags.toSorted(asc((x) => x.length))[0] // just in case
    if (shortest) location.hash = shortest
  }
  const makeOnly = groupize(_makeOnly, _makeOnlyGroup)
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
      currTag = newTag = tag
      myModal.showModal()
      $tagModalOpenStore = true
    }
  }
  const deleteTag = () => {
    myModal && myModal.close()
    noteDeri.sync.tagUpdate(currTag, O.none)
  }
  const doHash = (tag: string): Effect.Effect<void, string> => {
    if (!$allTags.filter((x) => x.startsWith(tag)).length) return Effect.fail("not yet?")
    const toToggle = $allTags.filter((x) => x.startsWith(tag))
    console.log("making only", tag, toToggle)
    return Effect.succeed(_makeOnlyGroup(toToggle))
  }
  onMount(async () => {
    const hash = decodeURIComponent(location.hash.slice(1))
    if (hash)
      Effect.runPromise(Effect.retry(doHash(hash), Schedule.fibonacci("100 millis"))).then(console.log)
  })
  let moreTags = false
  // const twoPlusTags = writable(false)
</script>

<div class="bg-base-200 sticky top-0 z-20">
  <button
    class="btn btn-sm btn-square btn-secondary absolute right-0 z-10 mt-[1px]"
    on:click={() => (moreTags = !moreTags)}>
    <label class="swap swap-flip" style="transform: rotate(-90deg)">
      <input disabled type="checkbox" checked={!moreTags} />
      <div class="swap-on"><ChevronDown font-size={24} style="transform: rotate(90deg)" /></div>
      <div class="swap-off"><ChevronUp font-size={24} style="transform: rotate(90deg)" /></div>
    </label>
  </button>

  <div class="flex overflow-x-clip" class:flex-wrap={moreTags}>
    <div class="tooltip tooltip-right tooltip-secondary" data-tip="toggle all">
      <button
        tabindex="0"
        class="btn btn-neutral btn-sm text-nowrap"
        on:click={checkClick}
        class:btn-outline={$exclTagSet.size}>
        <!-- on:contextmenu|preventDefault={() => (dropdownOpen = funLog("dropdownOpen")(!dropdownOpen))} -->
        <IconCheckbox />
      </button>
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
      <div class="tooltip tooltip-right tooltip-secondary" data-tip={`${$untagged} untagged`}>
        <button
          class="btn btn-neutral btn-sm text-nowrap"
          on:click={(e) => (e.shiftKey || isCmd(e) ? _toggleTag("") : _makeOnly(""))}
          class:btn-outline={$exclTagSet.has("")}>
          <!-- on:dblclick={_makeOnly("")} -->
          <IconTagOff />
        </button>
      </div>
    {/if}

    {#each $tagsCounts.filter((x) => E.toUnion(x)[0].length > 0) as tgc}
      {@const [tag, cnt, tags] = E.toUnion(tgc)}
      <div class="tooltip tooltip-right tooltip-secondary" data-tip={cnt} class:dropdown={tags}>
        <button
          class="btn btn-neutral btn-sm text-nowrap"
          on:click={(e) => (e.shiftKey || isCmd(e) ? toggle(tgc) : makeOnly(tgc))}
          on:contextmenu|preventDefault={onContextMenu(tag)}
          class:btn-outline={$excl(tgc)}
          >{tag}
        </button>
        {#if tags}
          <ul class="p-2 dropdown-content bg-base-200">
            {#each tags as tc}
              {@const [subTag, count] = tc}
              {@const displayedTag = subTag == tag ? tag : subTag.slice(tag.length)}
              <button
                class="btn btn-neutral btn-sm text-nowrap tooltip tooltip-right tooltip-secondary"
                data-tip={count}
                on:click={(e) => (e.shiftKey || isCmd(e) ? toggle(E.left(tc)) : makeOnly(E.left(tc)))}
                on:contextmenu|preventDefault={onContextMenu(subTag)}
                class:btn-outline={$excl(E.left(tc))}>
                {displayedTag}
              </button>
            {/each}
          </ul>
        {/if}
      </div>
    {:else}
      <button class=" m-auto underline" popovertarget="addTags">No tags yet, see how to add them</button>
    {/each}
  </div>
</div>

<div
  popover="auto"
  id="addTags"
  class="bg-base-300 max-w-96 rounded-2xl text-center p-4 border-4 border-neutral">
  <img alt="See how to add a tag 1." src={addTag} />
  Click here to edit tags
  <img alt="See how to add a tag 2." src={addTag2} />
  Type in the tag and press <kbd class="kbd">Enter</kbd>
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
