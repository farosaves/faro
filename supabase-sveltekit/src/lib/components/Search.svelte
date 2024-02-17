<script lang="ts">
  import fuzzysort from "fuzzysort";
  import Note from "./Note.svelte";
  import type { NoteEx, Notess } from "$lib/shared/first";
  import { array as A, option as O } from "fp-ts";
  import { identity, pipe } from "fp-ts/lib/function";

  export let notes: Notess;
  let query = "";
  let byTags = false;
  let byTitles = false;
  let byText = false;
  $: keys = [
    ...(byTags ? ["tags"] : []),
    ...(byTitles ? ["sources.title"] : []),
    ...(byText ? ["quote"] : []),
  ];

  let selectedKey: string;
  $: res =
    !!query && fuzzysort.go(query, notes, { key: selectedKey, limit: 5 });
  //   let allHighlight = (result: any) => fuzzysort.highlight(res[0]);
  $: res && res.length && console.log(fuzzysort.highlight(res[0])); //, "<b>", "</b>"));
  // console.log(fuzzysort.highlight(res[0], "<b>", "</b>"));
  // TODO: refactor as a store
  export let filterSortFun: (n: NoteEx) => NoteEx & { priority: number };
  if (res && res.length) {
    filterSortFun = (n) => {
      let priority: number;
      if (res && res.length)
        priority = pipe(
          Array.from(res),
          A.findFirstMap((r) => (r.obj.id == n.id ? O.some(r.score) : O.none)),
          O.match(() => 0, identity),
        );
      else priority = Date.parse(n.created_at);
      return { ...n, priority };
    };
  }
</script>

<form>
  <input
    type="text"
    placeholder="Type here"
    class="input w-full max-w-xs"
    bind:value={query} />
  <button hidden on:click={() => console.log(res, keys)}></button>
</form>
<!-- <label class="label cursor-pointer join-item">
    <span class="label-text">Tags</span>
    <input type="checkbox" bind:checked={byTags} class="checkbox" />
  </label> -->
<div>
  <div class="join w-full">
    <input
      class="join-item btn grow"
      type="radio"
      name="options"
      bind:group={selectedKey}
      value={"sources.title"}
      aria-label="Titles" />
    <input
      class="join-item btn grow"
      type="radio"
      name="options"
      aria-label="Text"
      bind:group={selectedKey}
      value={"quote"} />

    <!-- <input class="join-item btn" type="radio" name="options" aria-label="Radio 3" /> -->
  </div>
</div>
