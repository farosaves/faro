<script lang="ts">
  import Tags from "$lib/shared/Tags.svelte";
  import type { NoteEx } from "$lib/shared/first";
  import { identity } from "fp-ts/lib/function";
  import type { Readable } from "svelte/store";
  let tags: string[] = [];
  export let all_tags: Readable<string[]>;
  export let tagFilter: (
    n: NoteEx & { priority: number },
  ) => NoteEx & { priority: number } = identity;
  $: tagSet = new Set(tags);
  $: if (tags.length)
    tagFilter = (n) => {
      return {
        ...n,
        priority: n.tags?.map((s) => tagSet.has(s)).reduce((x, y) => x || y)
          ? n.priority
          : 0,
      };
    };
  else tagFilter = identity;
</script>

<Tags
  bind:tags
  autoComplete={$all_tags}
  onlyUnique={true}
  onlyAutocomplete={true}
  placeholder="Tags to filter with" />
