<script lang="ts">
  import fuzzysort from "fuzzysort";
  import type { NoteEx } from "shared";
  import { array as A, option as O } from "fp-ts";
  import { identity, pipe } from "fp-ts/lib/function";

  export let notes: NoteEx[];
  let query = "";

  let selectedKey: "sources.title" | "quote";
  $: res =
    !!query && fuzzysort.go(query, notes, { key: selectedKey, limit: 5 });
  //   let allHighlight = (result: any) => fuzzysort.highlight(res[0]);
  $: res && res.length && console.log(fuzzysort.highlight(res[0])); //, "<b>", "</b>"));
  // console.log(fuzzysort.highlight(res[0], "<b>", "</b>"));
  // TODO: refactor as a store
  export let filterSortFun: (n: NoteEx) => NoteEx & { priority: number };
  $: if (res && res.length) {
    filterSortFun = (n) => {
      let priority: number;
      let { quote, sources } = n;
      if (res && res.length) {
        priority = pipe(
          Array.from(res),
          A.findFirstMap((r) =>
            r.obj.id == n.id ? O.some(r.score + 1_000_000) : O.none,
          ),
          O.match(() => 0, identity),
        );
        let highlight = pipe(
          Array.from(res),
          A.findFirst((r) => r.obj.id == n.id),
          O.map((r) => fuzzysort.highlight(r, "<b>", "</b>")),
          O.chain(O.fromNullable),
          O.match(() => "", identity),
        );
        if (selectedKey == "quote") quote = highlight;
        else if (selectedKey == "sources.title") sources.title = highlight;
      } else priority = Date.parse(n.created_at);
      return { ...n, priority, quote, sources };
    };
  }
</script>

<div class="hidden">
  <form>
    <input
      type="text"
      placeholder="Type here"
      class="input w-full max-w-xs"
      bind:value={query} />
    <button
      hidden
      on:click={() => console.log(query, res, selectedKey, notes.length)}
    ></button>
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
</div>
