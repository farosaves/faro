<script lang="ts">
  import { derived } from "svelte/store"
  import { record as R, option as O, nonEmptyArray as NA } from "fp-ts"
  import { pipe } from "fp-ts/lib/function"
  import { desc, isCmd } from "$lib"
  import { uncheckedDomains } from "../filterSortStores"
  import type { NoteDeri } from "$lib/sync/deri"
  import { onMount } from "svelte"
  export let noteDeri: NoteDeri
  const domains = derived(noteDeri.noteArr, (x) =>
    pipe(
      x,
      NA.groupBy((n) => n.sources.domain),
      R.map((ns) => ns.length),
      R.toArray,
    ).toSorted(desc(([x, y]) => y)),
  )
  const toggleDomain = (domain: string) => {
    $uncheckedDomains.has(domain) ? $uncheckedDomains.delete(domain) : $uncheckedDomains.add(domain)
    $uncheckedDomains = $uncheckedDomains // store signal
  }
  const toggleAll = () => {
    if ($uncheckedDomains.size > 0) $uncheckedDomains = new Set()
    else $uncheckedDomains = new Set($domains.map(([x, y]) => x))
  }
  const makeOnly = (domain: string) =>
    ($uncheckedDomains = new Set($domains.map(([x, y]) => x).filter((t) => t != domain)))

  let details: HTMLDetailsElement
  onMount(() => {
    details = document.getElementById("details") as HTMLDetailsElement
    setTimeout(() => (details.open = !!$uncheckedDomains.size), 200)
  })
</script>

<details id="details" class="flex">
  <summary class="mb-2"> Sites </summary>
  <div class="join join-vertical bg-base-200 w-56 m-auto">
    <button
      class="btn btn-neutral btn-sm text-nowrap join-item w-full"
      on:click={toggleAll}
      class:btn-outline={$uncheckedDomains.size}>
      Toggle All
    </button>

    {#each $domains as [domain, num], i}
      <div class="tooltip tooltip-top tooltip-secondary p-0 join-item" data-tip={num}>
        <button
          class="btn btn-neutral btn-sm text-nowrap join-item w-full"
          on:click={(e) => (e.shiftKey || isCmd(e) ? toggleDomain(domain) : makeOnly(domain))}
          class:btn-outline={$uncheckedDomains.has(domain)}>
          {domain}
        </button>
      </div>
    {/each}
  </div>
</details>
