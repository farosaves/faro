<script lang="ts">
  import type { NoteEx, NoteSync, Notes, SourceData } from "shared"
  import { derived, type Readable } from "svelte/store"
  import { record as R, array as A, option as O, nonEmptyArray as NA } from "fp-ts"
  import { pipe } from "fp-ts/lib/function"
  import { desc, hostname } from "shared"
  import { uncheckedDomains } from "$lib/filterSortStores"
  export let note_sync: NoteSync
  // const notestore = note_sync.notestore
  const hostnameStr = (n: SourceData) => O.getOrElse(() => "")(hostname(n.sources.url))
  const domains = derived(note_sync.noteArr, x =>
    pipe(
      x,
      NA.groupBy(hostnameStr),
      R.map(ns => ns.length),
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
  <summary> Domains </summary>
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
