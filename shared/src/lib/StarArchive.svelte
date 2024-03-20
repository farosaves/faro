<script lang="ts">
  import IconStar from "~icons/tabler/star"
  import IconStarFill from "~icons/tabler/star-filled"
  import IconArchive from "~icons/tabler/archive"
  import IconArchiveFill from "~icons/tabler/archive-filled"
  import { shortcut } from "./shortcut"
  export let hovered: boolean
  const defaultP = 0
  export let p: number
  export let changeP: (p: number) => void
  const onClick = (n: number) => () => hovered && changeP((p = p == n ? defaultP : n))
</script>

<span class="flex w-full">
  <label class="swap swap-flip grow-0" class:swap-active={p == 5}>
    <input
      type="checkbox"
      class="tooltip tooltip-secondary tooltip-right"
      data-tip="Alt+S"
      checked={false}
      on:click|preventDefault={onClick(5)}
      use:shortcut={{ alt: true, code: "KeyS" }} />
    <IconStar class="swap-off" />
    <IconStarFill class="swap-on text-primary" />
    <!-- </div> -->
  </label>

  <div class="grow">
    <slot />
  </div>

  <label class="swap swap-flip grow-0" class:swap-active={p == -5}>
    <input
      type="checkbox"
      class="tooltip tooltip-secondary tooltip-left"
      data-tip="Alt+X"
      checked={false}
      on:click|preventDefault={onClick(-5)}
      use:shortcut={{ alt: true, code: "KeyX" }} />

    <IconArchive class="swap-off" />
    <IconArchiveFill class="swap-on text-primary" />
  </label>
</span>
