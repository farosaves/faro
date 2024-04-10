<script lang="ts">
  import { modalOpenStore, modalStore, modalSub } from "$lib/stores"
</script>

<dialog id="modal$" class="modal" use:modalSub on:close={() => ($modalOpenStore = false)}>
  <div class="modal-box">
    <p class="py-4">
      {$modalStore}
    </p>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
