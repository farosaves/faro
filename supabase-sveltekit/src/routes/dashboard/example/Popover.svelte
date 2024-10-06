<script lang="ts">
  import { onMount } from "svelte"
  import { fade } from "svelte/transition"

  let tooltip: HTMLDialogElement

  export let arrow = false

  export let className = ""
  export let nth = 0

  export let align: "left" | "top" = "left"

  function positionElementRelativeToFixed(fixedElement: Element | null) {
    if (!fixedElement) return console.error("No fixed element or element to position")

    // Get the bounding rectangle of the fixed element
    const fixedRect = fixedElement.getBoundingClientRect()

    if (align === "left") {
      tooltip.style.left = `${fixedRect.left}px`
      tooltip.style.transform = "translate(-105%, -50%)"
      tooltip.style.top = `${fixedRect.top + fixedRect.height / 2}px`
    } else if (align === "top") {
      tooltip.style.left = `${fixedRect.left + fixedRect.width / 2}px`
      tooltip.style.transform = "translate(-50%, -105%)"
      tooltip.style.top = `${fixedRect.top}px`
    }
  }
  onMount(() => {
    if (className) positionElementRelativeToFixed(document.getElementsByClassName(className).item(nth))
    tooltip.show()
  })
</script>

<!-- Z index of modal is 999. -->
<dialog
  class="fixed bg-base-100 shadow-lg w-96 rounded-2xl bg-gradient-to-br from-secondary via-transparent to-primary"
  class:arrow
  transition:fade
  bind:this={tooltip}
  style="top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 9999">
  <div class="flex flex-col place-content-center items-center bg-base-100 m-[2px] rounded-2xl z-[9999]">
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
    border-color: transparent transparent transparent oklch(var(--p));
  }
</style>
