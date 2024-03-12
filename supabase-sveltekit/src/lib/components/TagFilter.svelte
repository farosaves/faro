<script lang="ts">
  import { Tags } from "shared"
  import type { NoteEx } from "shared"
  import { array as A } from "fp-ts"
  import { identity, pipe } from "fp-ts/lib/function"
  import type { Readable } from "svelte/store"
  let exclTags: string[] = []
  export let all_tags: Readable<string[]>
  export let tagFilter: (n: NoteEx & { priority: number }) => NoteEx & { priority: number } = identity
  $: tagSet = new Set(exclTags)
  $: if (exclTags.length)
    tagFilter = (n) => {
      return {
        ...n,
        priority: pipe(
          n.tags || [],
          A.map((s) => tagSet.has(s)),
          A.reduce(false, (x, y) => x || y),
        )
          ? n.priority
          : 0,
      }
    }
  else tagFilter = identity
</script>

<Tags
  bind:tags={exclTags}
  autoComplete={$all_tags}
  minChars="0"
  onlyUnique={true}
  onlyAutocomplete={true}
  placeholder="Tags to filter with" />
