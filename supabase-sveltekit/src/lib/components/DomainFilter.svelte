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
  import type { Option } from "fp-ts/lib/Option";
  import { desc, hostname, mapSome } from "$lib/shared/utils";
  export let note_sync: NoteSync;
  export let domainFilter: NoteFilter;
  const notestore = note_sync.notestore;

  const domains = derived(notestore, (x) =>
    pipe(
      Object.values(x),
      mapSome((xs) =>
        pipe(
          xs,
          A.last,
          O.map((x) => {
            return { domain: hostname(x.sources.url), num: xs.length };
          }),
        ),
      ),
      NA.groupBy((x) => x.domain),
      R.map(NA.reduce(0, (x, y) => x + y.num)),
      R.toArray,
    ).toSorted(desc(([x, y]) => y)),
  );
</script>

<ul class="menu bg-base-200 w-56 rounded-box">
  {#each $domains as [domain, num]}
    <li>{domain} {num}</li>
  {/each}
</ul>
