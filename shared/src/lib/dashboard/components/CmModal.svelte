<script lang="ts">
  import { mapElse } from "$lib"
  import { modalOpenStore, modalNote, modalSub, toastNotify } from "$lib/stores"
  import IconLink from "~icons/jam/link"
  $: p = mapElse($modalNote)
  const onclick = () => {
    navigator.clipboard.writeText(import.meta.env.VITE_PI_IP + "/notes/" + p((n) => n.id, ""))
    toastNotify("Copied to clipboard.")
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
      Created at: {p((n) => fmt.format(Date.parse(n.created_at)), "")}
    </p>
    <button class="flex flex-row" on:click={onclick}>
      <IconLink font-size="24" /> Copy Link
    </button>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
