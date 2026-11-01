<script lang="ts">
  // import { Icon, CheckCircle, XCircle, ArchiveBoxXMark } from "svelte-hero-icons"
  // import { IconCheckbox, IconTagOff } from "@tabler/icons-svelte"
  import IconCheckbox from "~icons/tabler/checkbox"
  import IconTagOff from "~icons/tabler/tag-off"

  import { flow, pipe } from "fp-ts/lib/function"
  import { array as A, set as S, option as O, either as E, string as Str } from "fp-ts"
  import { NoteDeri, asc, desc, funLog, isCmd, sleep, tagModalOpenStore } from "$lib"
  import { derived, get, writable } from "svelte/store"
  import { exclTagSet, exclTagSets } from "../filterSortStores"
  exclTagSets.subscribe(funLog("exclTagSets"))
  import { getGroupTagCounts, groupize } from "./tagViewStores"
  import { onMount } from "svelte"
  import addTag from "$lib/assets/addTag.jpg"
  import addTag2 from "$lib/assets/addTag2.jpg"

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
    location.hash = tag || " " // empty tag
  }
  const _makeOnlyGroup = (tags: string[]) => {
    $exclTagSets.sets[$exclTagSets.currId] = new Set($allTags)
    _toggleTagGroup(tags)
    const group = tags[0].split("/")[0] // top lvl
    if (group !== undefined) location.hash = group || " "
  }
  const makeOnly = groupize(_makeOnly, _makeOnlyGroup)
  // let modalPotential: boolean
  let myModal: HTMLDialogElement | null = null
  let currTag: string
  let newTag: string
  const updateTag = () => {
    if (newTag === "") return false
    if (currTag === newTag) return true
    noteDeri.sync.tagUpdate(currTag, O.some(newTag), get(allTags))
    currTag = newTag
    return true
  }
  const onContextMenu = (tag: string) => () => window.postMessage({ action: "editTag", tag }, "*")

  const deleteTag = () => {
    myModal && myModal.close()
    noteDeri.sync.tagUpdate(currTag, O.none, get(allTags))
  }
  // let dropdownOpen = false
  // let hRem = 4 // style="height: {hRem}rem
  const f =
    <T, U>(l: (x: T[]) => U, r: (x: T) => U) =>
    (x: T[]) =>
      x.length == 1 ? r(x[0]) : l(x)
  const makeOnlyFromHash = (arr: Array<string>) => {
    const hash = decodeURIComponent(location.hash.slice(1))
    if (!hash) return false
    const toToggle = arr.filter((tag) => tag.startsWith(hash + "/") || tag == (hash == " " ? "" : hash))
    funLog("toToggle")(toToggle)
    if (!toToggle.length) return false
    f(_makeOnlyGroup, _makeOnly)(toToggle)
    return true
  }
  let div: HTMLDivElement
  onMount(() => {
    makeOnlyFromHash($allTags) || sleep(500).then(() => makeOnlyFromHash($allTags))
  })
  allTags.subscribe(makeOnlyFromHash)

  // let dropdownOpen = false
  let moreTags = false

  // addEventListener("message", (event) => {event.data});
  window.onmessage = (event) => {
    const { data } = event
    if (data.action !== "editTag") return
    if (myModal) {
      currTag = newTag = data.tag
      myModal.showModal()
      $tagModalOpenStore = true
    }
  }

  // const twoPlusTags = writable(false)
</script>

<div class="sticky top-0 z-20 overflow-y-scroll h-screen no-scrollbar min-w-24 lg:ml-4 pb-16" bind:this={div}>
  <!-- <button  TODO: on phones it'd be nice for it to be collapsible the way left bar is
    class="btn btn-sm btn-square btn-secondary opacity-70 hover:opacity-100 absolute right-0 z-10 rounded-s-btn rounded-e-none"
    on:click={() => (moreTags = !moreTags)}>
    <label class="swap swap-flip" style="transform: rotate(0deg)">
      <input disabled type="checkbox" checked={!moreTags} />
      <div class="swap-on"><ChevronDown font-size={24} style="transform: rotate(90deg)" /></div>
      <div class="swap-off"><ChevronUp font-size={24} style="transform: rotate(90deg)" /></div>
    </label>
  </button> -->

  <div class="flex flex-col overflow-x-clip place-items-stretch" class:flex-wrap={moreTags}>
    <div class="flex tooltip tooltip-bottom tooltip-secondary m-1" data-tip="toggle all">
      <button
        class="font-bold kbd bg-base-100"
        on:click={checkClick}
        class:opacity-50={$exclTagSet.size}
        class:border-0={$exclTagSet.size}>
        <!-- on:contextmenu|preventDefault={() => (dropdownOpen = funLog("dropdownOpen")(!dropdownOpen))} -->
        <IconCheckbox />
      </button>
    </div>

    <!-- <div class="tooltip tooltip-top tooltip-secondary carousel-item" data-tip="2+ tags">
      <button
        class="btn btn-neutral btn-sm text-nowrap"
        on:click={() => ($twoPlusTags = !$twoPlusTags)}
        class:btn-outline={!$twoPlusTags}>
        <IconCheckbox />
      </button>
    </div> -->
    {#if $untagged}
      <div class="flex tooltip tooltip-top tooltip-secondary m-1" data-tip={`${$untagged} untagged`}>
        <button
          class="font-bold kbd bg-base-100"
          on:click={(e) => (e.shiftKey || isCmd(e) ? _toggleTag("") : _makeOnly(""))}
          class:opacity-50={$exclTagSet.has("")}
          class:border-0={$exclTagSet.has("")}>
          <!-- on:dblclick={_makeOnly("")} -->
          <IconTagOff />
        </button>
      </div>
    {/if}

    {#each $tagsCounts.filter((x) => E.toUnion(x)[0].length > 0) as tgc}
      {@const [tag, cnt, tags] = E.toUnion(tgc)}
      <div class="m-1 expander-parent">
        <button
          class="tooltip tooltip-top tooltip-secondary font-bold kbd bg-base-100"
          on:click={(e) => (e.shiftKey || isCmd(e) ? toggle(tgc) : makeOnly(tgc))}
          on:contextmenu|preventDefault={onContextMenu(tag)}
          class:border-0={$excl(tgc)}
          class:bg-opacity-50={$excl(tgc)}
          data-tip={cnt}
          ><span class:opacity-50={$excl(tgc)}>{tag}</span>
        </button>
        {#if tags}
          <!-- style="transition: all 1s" -->
          <div class="expander" class:expanded={!$excl(tgc)}>
            <ul class="p-1 bg-base-300 rounded-box min-h-0 expander-content">
              {#each tags.toSorted(desc( ([t, _c]) => -t.split("/").length, ([_t, c]) => c, )) as tc}
                {@const [subTag, count] = tc}
                {@const displayedTag = subTag == tag ? tag : subTag.slice(tag.length)}
                <li>
                  <button
                    class="tooltip tooltip-top tooltip-secondary font-bold kbd bg-base-100"
                    data-tip={count}
                    on:click={(e) => (e.shiftKey || isCmd(e) ? toggle(E.left(tc)) : makeOnly(E.left(tc)))}
                    on:contextmenu|preventDefault={onContextMenu(subTag)}
                    class:opacity-50={$excl(E.left(tc))}
                    class:border-0={$excl(E.left(tc))}>
                    <!-- class:p-y={$excl(E.left(tc))} -->
                    {displayedTag}
                  </button>
                </li>
              {/each}
            </ul>
          </div>
        {/if}
      </div>
    {:else}
      <button class="m-auto underline w-24" popovertarget="addTags">No tags yet, see how to add them</button>
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
  <div class="modal-box flex flex-col border-2 items-center border-secondary">
    <button
      class="btn btn-sm btn-circle btn-ghost absolute top-2 right-2"
      on:click={() => myModal && myModal.close()}>✕</button>
    <p class="py-2 text-center">
      Rename this tag
      <!-- :<br /> {currTag} -->
    </p>
    <form class=" ">
      <input class="input input-bordered text-center" type="text" bind:value={newTag} />
      <button hidden on:click={updateTag} />
    </form>
    <button
      class="btn text-error mt-2 tooltip"
      data-tip="This only deletes the label not the saves"
      on:click={deleteTag}>Delete</button>
    <!-- on:click={() => newTag && updateTag(currTag, newTag) && (currTag = newTag) && console.log("aa")} -->
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>

<style>
  /* Hide scrollbar for Chrome, Safari and Opera */
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }

  /* Hide scrollbar for IE, Edge and Firefox */
  .no-scrollbar {
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
  }

  .expander {
    display: grid;
    grid-template-rows: 0fr;
    overflow: hidden;
    opacity: 0%;
    transition: all 0.2s ease-in-out 0.1s;
    max-height: 0;
  }
  .expander-content {
    min-height: 0;
  }
  .expander-parent:focus-within .expander {
    grid-template-rows: 1fr;
    opacity: 100%;
    overflow: visible;
    /* HACK */
    max-height: 500vh;
  }
</style>
