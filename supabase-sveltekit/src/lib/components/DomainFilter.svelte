<script lang="ts">
  import type { NoteSync } from "$lib/shared/note-sync";
  import type { NoteFilter } from "$lib/utils";
  import { derived } from "svelte/store";
  import {
    record as R,
    array as A,
    option as O,
    nonEmptyArray as NA,
  } from "fp-ts";
  import { pipe } from "fp-ts/lib/function";
  import { desc, hostname } from "$lib/shared/utils";
  export let note_sync: NoteSync;
  export let domainFilter: NoteFilter;
  const notestore = note_sync.notestore;

  const domains = derived(notestore, (x) =>
    pipe(
      Object.values(x),
      // prettier-ignore
      NA.groupBy(a => pipe(a, A.last, O.match(() => "", x => hostname(x.sources.url)))),
      R.map(NA.reduce(0, (x, y) => x + y.length)),
      R.filter((x) => x > 1),
      R.toArray,
    ).toSorted(desc(([x, y]) => y)),
  );
  let uncheckedDomains = new Set<string>();
  const toggleDomain = (domain: string) => () => {
    uncheckedDomains.has(domain)
      ? uncheckedDomains.delete(domain)
      : uncheckedDomains.add(domain);
    uncheckedDomains = uncheckedDomains; // store signal
  };
  $: domainFilter = (n) => {
    if (uncheckedDomains.has(hostname(n.sources.url))) n.priority = 0;
    return n;
  };
</script>

<details>
  <summary
    >All Domains
    <!-- <label class="label cursor-pointer">
      <span class="label-text"></span>
      <input type="checkbox" checked class="checkbox" />
    </label> -->
  </summary>
  <ul class="menu bg-base-200 w-56 rounded-box">
    {#each $domains as [domain, num], i}
      <li>
        <label class="label cursor-pointer">
          <span class="label-text">{num} {domain}</span>
          <input
            type="checkbox"
            checked
            on:change={toggleDomain(domain)}
            class="checkbox" />
        </label>
      </li>
    {/each}
  </ul>
</details>
