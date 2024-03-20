<script lang="ts">
  import IconStar from "~icons/tabler/star"
  import IconStarFill from "~icons/tabler/star-filled"
  import IconArchive from "~icons/tabler/archive"
  import IconArchiveFill from "~icons/tabler/archive-filled"
  import { shortcut } from "./shortcut"
  export let isOpen: boolean
  const defaultP = 0
  export let p: number
  export let changeP: (p: number) => void
  // opacity-0 hover:opacity-100
  const onClick = (n: number) => () => isOpen && changeP((p = p == n ? defaultP : n))
</script>

<span class="flex w-full">
  <label class="swap swap-flip grow-0">
    <input
      type="checkbox"
      checked={p == 5}
      on:click={onClick(5)}
      use:shortcut={{ alt: true, code: "KeyS" }} />
    <IconStar class="swap-off" />
    <IconStarFill class="swap-on text-primary" />
  </label>

  <div class="grow">
    {p}
    <slot />
  </div>

  <label class="swap swap-flip grow-0">
    <input
      type="checkbox"
      checked={p == -5}
      on:click={onClick(-5)}
      use:shortcut={{ alt: true, code: "KeyX" }} />
    <IconArchive class="swap-off" />
    <IconArchiveFill class="swap-on text-primary" />
  </label>
</span>
