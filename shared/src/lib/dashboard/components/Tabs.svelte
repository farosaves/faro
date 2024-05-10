<script lang="ts">
  import { set as S, string as Str } from "fp-ts"
  import { NoteDeri } from "shared"
  import { get } from "svelte/store"
  import { exclTagSets, exclTagSets as t } from "../filterSortStores"
  export let noteDeri: NoteDeri
  const tab_ids = ["1", "2"]
  const tab_titles = ["tab one", "tab two"]
  const tab_actives = [new Set<string>(), new Set<string>()]
  let active_tab = -1 // Option<number> = O.none
  const onClick = (newActive: number) => () => {
    const lastActive = active_tab
    const allTagSet = new Set(get(noteDeri.allTags)).add("")
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
    <div class="tooltip tooltip-right tooltip-primary carousel-item grow" data-tip={"?? untagged"}>
      <button
        class="btn btn-neutral btn-sm text-nowrap w-full"
        class:btn-outline={active_tab != i}
        on:click={onClick(i)}
        >{title}
      </button>
    </div>
  {/each}
</div>
