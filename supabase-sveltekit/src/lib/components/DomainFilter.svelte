<script lang="ts">
  import type { NoteEx, NoteSync, Notes } from "shared"
  import type { NoteFilter } from "$lib/utils"
  import { derived, type Readable } from "svelte/store"
  import { record as R, array as A, option as O, nonEmptyArray as NA } from "fp-ts"
  import { pipe } from "fp-ts/lib/function"
  import { desc, hostname } from "shared"
  export let note_sync: NoteSync
  export let domainFilter: NoteFilter
  // const notestore = note_sync.notestore
  const domains = derived(note_sync.noteArr, (x) =>
    pipe(
      x,
      // prettier-ignore
      NA.groupBy((n) => hostname(n.sources.url)),
      R.map((ns) => ns.length),
      // R.filter((x) => x > 1),
      R.toArray,
    ).toSorted(desc(([x, y]) => y)),
  )
  let uncheckedDomains = new Set<string>()
  const toggleDomain = (domain: string) => () => {
    uncheckedDomains.has(domain) ? uncheckedDomains.delete(domain) : uncheckedDomains.add(domain)
    uncheckedDomains = uncheckedDomains // store signal
  }
  $: domainFilter = (n) => {
    if (uncheckedDomains.has(hostname(n.sources.url))) n.priority = 0
    return n
  }
  const toggleAll = () => {
    // assigns to trigger potential $:
    if (uncheckedDomains.size > 0) uncheckedDomains = new Set()
    else uncheckedDomains = new Set($domains.map(([x, y]) => x))
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
            checked={!uncheckedDomains.has(domain)}
            on:click={toggleDomain(domain)}
            class="checkbox" />
        </label>
      </li>
    {/each}
  </ul>
</details>
