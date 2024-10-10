<script lang="ts">
  import { scrolled } from "$lib/utils"
  import { onMount } from "svelte"
  import { fade } from "svelte/transition"
  import { getElementByText } from "./common"

  let tooltip: HTMLDialogElement

  export let arrow = false

  export let className = ""
  export let nth = 0
  export let text = ""

  export let align: "left" | "top" = "left"

  function positionElementRelative(element: Element | null) {
    if (!element) return console.error("No element")

    // Get the bounding rectangle of the fixed element
    const rect = element.getBoundingClientRect()

    if (align === "left") {
      tooltip.style.left = `${rect.left}px`
      tooltip.style.transform = "translate(-105%, -50%)"
      tooltip.style.top = `${rect.top + $scrolled + rect.height / 2}px`
    } else if (align === "top") {
      tooltip.style.left = `${rect.left + rect.width / 2}px`
      tooltip.style.transform = "translate(-50%, -115%)"
      tooltip.style.top = `${rect.top + $scrolled}px`
    }
  }
  onMount(() => {
    const element = getElementByText(className, text, nth)
    if (element) positionElementRelative(element)
    tooltip.show()
  })
</script>

<!-- Z index of modal is 999. -->
<dialog
  class="absolute w-96 rounded-2xl bg-gradient-to-br from-secondary via-yellow-100 to-primary shadow-2xl m-0 hidden sm:block"
  class:arrow
  class:top={align === "top"}
  transition:fade
  bind:this={tooltip}
  style="top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 9999">
  <div
    class="flex flex-col place-content-center items-center m-1 rounded-2xl z-[9999] text-center"
    style="background-color: color-mix(in srgb, oklch(var(--p)), oklch(var(--b1)) 80%)">
    <slot />
  </div>
</dialog>

<style>
  .arrow:after {
    content: "";
    position: absolute;
    top: 50%;
    left: 100%;
    margin-top: -15px;
    border-width: 15px;
    border-style: solid;
    border-color: transparent transparent transparent color-mix(in srgb, oklch(var(--p)), #fef9c3);
  }
  .top:after {
    top: 100%;
    left: 50%;
    margin-top: 0;
    margin-left: -15px;
    border-width: 15px;
    border-style: solid;
    border-color: color-mix(in srgb, oklch(var(--p)), #fef9c3) transparent transparent transparent;
  }
</style>
