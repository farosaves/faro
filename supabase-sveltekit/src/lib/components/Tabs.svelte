<script lang="ts">
  import { identity, pipe } from "fp-ts/lib/function"
  import { array as A, record as R, nonEmptyArray as NA, option as O, set as S, string as Str } from "fp-ts"
  import { desc, type NoteEx, type NoteSync } from "shared"
  import { derived, get, writable } from "svelte/store"
  import { exclTagSets, exclTagSets as t, tagFilter } from "$lib/filterSortStores"
  import { modalOpenStore } from "shared"
  import type { Option } from "fp-ts/lib/Option"
  export let note_sync: NoteSync
  let noteStore = note_sync.noteStore
  $: console.log(Array.from($t.sets[$t.currId]))
  const tab_ids = ["1", "2"]
  const tab_titles = ["tab one", "tab two"]
  const tab_actives = [new Set<string>(), new Set<string>()]
  let active_tab = -1 //Option<number> = O.none
  const onClick = (newActive: number) => () => {
    const lastActive = active_tab
    const allTagSet = new Set(get(note_sync.alltags)).add("")
    if (lastActive == -1) {
      // turning on tab
      exclTagSets.update((s) => {
        // set excl tag set for new one to (all - active)
        s.sets[tab_ids[newActive]] = S.difference(Str.Eq)(allTagSet, tab_actives[newActive])
        s.currId = tab_ids[newActive]
        return s
      })
    } else if (lastActive == newActive) {
      // turning off tab
      exclTagSets.update((s) => {
        // save the current state
        tab_actives[newActive] = S.difference(Str.Eq)(allTagSet, s.sets[s.currId])
        s.currId = ""
        return s
      })
    } else {
      // switching tab
      exclTagSets.update((s) => {
        // save the current state
        tab_actives[lastActive] = S.difference(Str.Eq)(allTagSet, s.sets[s.currId])
        // set excl tag set for new one to (all - active)
        s.sets[tab_ids[newActive]] = S.difference(Str.Eq)(allTagSet, tab_actives[newActive])
        s.currId = tab_ids[newActive]
        return s
      })
    }
    console.log(lastActive, newActive, get(exclTagSets))
    active_tab = active_tab != newActive ? newActive : -1
  }
</script>

<div class="bg-base-100 sticky top-0 z-20 carousel w-[99%] flex">
  {#each tab_titles as title, i}
    <div class="tooltip tooltip-right tooltip-primary carousel-item grow" data-tip={`?? untagged`}>
      <button
        class="btn btn-neutral btn-sm text-nowrap w-full"
        class:btn-outline={active_tab != i}
        on:click={onClick(i)}
        >{title}
      </button>
    </div>
  {/each}
</div>
