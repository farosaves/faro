<script lang="ts">
  import IconStar from "~icons/tabler/star"
  import IconStarFill from "~icons/tabler/star-filled"
  import IconArchive from "~icons/tabler/archive"
  import IconArchiveFill from "~icons/tabler/archive-filled"
  import { shortcut } from "./shortcut"
  import { altKey, ctrlKey } from "./utils"
  import { toastNotify } from "./stores"
  export let hovered: boolean
  const defaultP = 0
  export let p: number
  export let changeP: (p: number) => void
  const toggleP = (n: number) => changeP((p = p == n ? defaultP : n))
  const star = () => {
    if (hovered) {
      toggleP(5)
      toastNotify("Starred")
    }
  }
  const archive = () => {
    if (hovered) {
      toggleP(-5)
      toastNotify("Archived")
    }
  }
</script>

<span class="flex w-full">
  <label class="swap swap-flip grow-0" class:swap-active={p == 5}>
    <input
      type="checkbox"
      class="tooltip tooltip-secondary tooltip-right"
      data-umami-event="Note Star"
      data-tip="{ctrlKey}+S"
      checked={false}
      on:click|preventDefault={star}
      use:shortcut={{ control: true, code: "KeyS" }} />
    <IconStar class="swap-off" />
    <IconStarFill class="swap-on text-primary" />
    <!-- </div> -->
  </label>

  <div class="grow flex justify-center">
    <slot />
  </div>

  <label class="swap swap-flip grow-0" class:swap-active={p == -5}>
    <input
      type="checkbox"
      class="tooltip tooltip-secondary tooltip-left"
      data-umami-event="Note Arch"
      data-tip="{ctrlKey}+X"
      checked={false}
      on:click|preventDefault={archive}
      use:shortcut={{ control: true, code: "KeyX" }} />

    <IconArchive class="swap-off" />
    <IconArchiveFill class="swap-on text-primary" />
  </label>
</span>
