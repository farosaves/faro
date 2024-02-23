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
  import { flow, pipe } from "fp-ts/lib/function";
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
      R.toArray,
    ).toSorted(desc(([x, y]) => y)),
  );
</script>

<ul class="menu bg-base-200 w-56 rounded-box">
  {#each $domains as [domain, num]}
    <li>{domain} {num}</li>
  {/each}
</ul>
