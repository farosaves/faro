<script lang="ts">
  import { mapElse } from "$lib"
  import { modalOpenStore, modalNote, modalSub, toastNotify } from "$lib/stores"
  import IconLink from "~icons/jam/link"
  import IconCheck from "~icons/jam/check"
  $: p = mapElse($modalNote)
  let greenCheck = false
  const onclick = () => {
    greenCheck = true
    navigator.clipboard.writeText(import.meta.env.VITE_PI_IP + "/" + p((n) => n.id, ""))
    toastNotify("Copied to clipboard.")
    setTimeout(() => (greenCheck = false), 1000)
  }
  const fmt = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
  })
</script>

<dialog id="modal$" class="modal" use:modalSub on:close={() => ($modalOpenStore = false)}>
  <div class="modal-box">
    <p class="py-4">
      Created: {p((n) => fmt.format(Date.parse(n.created_at)), "")}
    </p>
    <!-- <button class="flex flex-row relative" on:click={onclick}>
      <IconLink font-size="24" />
      <IconCheck
        font-size="24"
        style="position: absolute; top: 0; left: 0; color:green; {!greenCheck ? 'display:none;' : ''}" />
      <IconCheck font-size="24" style="position:" />
      <div>Copy Link</div>
    </button> -->
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
