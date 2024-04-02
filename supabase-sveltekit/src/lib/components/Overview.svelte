<script lang="ts">
  import { exclTagSet, exclTagSets } from "$lib/filterSortStores"
  import { option as O, array as A, string as S } from "fp-ts"
  import { MyTags, sleep, type NoteSync } from "shared"
  import { derived, get, writable } from "svelte/store"

  // type OptionValueType<T> = T extends O.Option<infer R> ? R : never
  const id = "a"
  export let note_sync: NoteSync
  const allTags = note_sync.alltags
  let this_element: Element
  const isOpen = writable(false)
  let tags = writable<string[]>([])

  // as long as open read from the top
  $: if ($isOpen) $tags = $allTags.filter(x => !$exclTagSet.has(x))
  const toggleOpen = async (e: MouseEvent) => {
    const _isOpen = $isOpen
    // close_all_notes()
    await sleep(1)
    $isOpen = !_isOpen
    await sleep(1)
    // if ($isOpen) $exclTagSets.ui = O.some(id)
    // else $exclTagSets.ui = O.none
    // await sleep(1)
    // $exclTagSets.ss[O.getOrElse(() => "")($exclTagSets.ui)] = new Set(
    //   A.difference(S.Eq)($allTags, $tags).concat(""),
    // )
    // @ts-expect-error
    if (!$isOpen) e.target?.blur()
  }
  //   $: if ($isOpen) {
  //     $exclTagSet = new Set(A.difference(S.Eq)($allTags, $tags))
  //   }
  //   exclTagSet.subscribe((s) => {
  //     if ($isOpen) tags.set(get(allTags).filter((x) => !s.has(x)))
  //   })
  //   const limitTags: O.Option<string[]> = O.none

  //   $: tags = note_data.tags || []

  //   $: onTagAdded = note_sync.tagChange(note_data)
  //   $: onTagRemoved = note_sync.tagChange(note_data)

  let highlighting = false
  const highlightMe = () => {
    this_element.scrollIntoView({ block: "center" })
    highlighting = true
    setTimeout(() => (highlighting = false), 1000)
    return true
  }
  //   onMount(() => {
  //     "highlightOnMount" in note_data &&
  //       note_data["highlightOnMount"] &&
  //       highlightMe() &&
  //       (note_data["highlightOnMount"] = false)
  //   })
  let textContent = "hey"
  const onTagAdded = (a: any, b: any) => {}
  const onTagRemoved = (a: any, b: any) => {}
</script>

<div
  class="collapse bg-base-200 border-primary"
  style="border-width: {1 + 5 * +highlighting}px; position: static;">
  <input type="checkbox" class="-z-10" bind:checked={$isOpen} />
  <div
    class="collapse-title text-center"
    bind:this={this_element}
    style="font-size: 0.95rem; padding: 0.5rem; grid-column-start:1; position: static;">
    <!-- <button
      on:click={async () => {
        const _isOpen = $isOpen
        // close_all_notes()
        // svelte stores....
        await sleep(1)
        $isOpen = !_isOpen
      }}
      on:dblclick={dblclick}> -->
    <textarea
      class="textarea textarea-borderedtext-center"
      contenteditable
      bind:textContent
      on:click={toggleOpen} />
    <!-- </button> -->
    <span>
      <MyTags tags={[...$tags]} autoComplete={$allTags} {onTagAdded} {onTagRemoved} />
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
          //   close_all_notes()
        }}>DELETE</button>
    </div>
  </div>
</div>
