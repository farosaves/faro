<script lang="ts">
  import type { SourceData } from "shared"
  import { derived } from "svelte/store"
  import { record as R, option as O, nonEmptyArray as NA } from "fp-ts"
  import { pipe } from "fp-ts/lib/function"
  import { desc, hostname } from "shared"
  import { uncheckedDomains } from "../filterSortStores"
  import type { NoteDeri } from "$lib/sync/deri"
  export let noteDeri: NoteDeri
  const domains = derived(noteDeri.noteArr, (x) =>
    pipe(
      x,
      NA.groupBy((n) => n.sources.domain),
      R.map((ns) => ns.length),
      R.toArray,
    ).toSorted(desc(([x, y]) => y)),
  )
  const toggleDomain = (domain: string) => () => {
    $uncheckedDomains.has(domain) ? $uncheckedDomains.delete(domain) : $uncheckedDomains.add(domain)
    $uncheckedDomains = $uncheckedDomains // store signal
  }
  const toggleAll = () => {
    // assigns to trigger potential $:
    if ($uncheckedDomains.size > 0) $uncheckedDomains = new Set()
    else $uncheckedDomains = new Set($domains.map(([x, y]) => x))
  }
</script>

<details>
  <summary> Sites </summary>
  <ul class="menu bg-base-200 w-56 rounded-box">
    <li>
      <label class="label cursor-pointer">
        <span class="label-text">Toggle All</span>
        <input type="checkbox" checked on:change={toggleAll} class="checkbox" />
      </label>
    </li>

    {#each $domains as [domain, num], i}
      <li>
        <label class="label cursor-pointer">
          <span class="label-text tooltip tooltip-left tooltip-primary" data-tip={num}>{domain}</span>
          <input
            type="checkbox"
            checked={!$uncheckedDomains.has(domain)}
            on:click={toggleDomain(domain)}
            class="checkbox" />
        </label>
      </li>
    {/each}
  </ul>
</details>
