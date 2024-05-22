<script lang="ts">
  export let form
  import IconSend from "~icons/jam/paper-plane"
</script>

<svelte:head>
  <title>Faros - Farewell</title>
</svelte:head>

<div class="hero min-h-screen bg-base-300">
  <div class="hero-content text-center">
    <div class="max-w-lg">
      <h1 class="my-6 text-5xl font-bold">Farewell!</h1>
      {#if form?.success}<div class="collapse collapse-close bg-base-100">
          <div class="collapse-title text-xl font-medium text-center p-4">Thank you!</div>
        </div>
      {:else}
        <div class="collapse bg-base-100">
          <input type="checkbox" />
          <div class="collapse-title text-xl font-medium text-center p-4">
            If you have any message, please share
          </div>
          <div class="collapse-content mx-4">
            <form method="POST">
              <label class="input input-bordered flex items-center gap-2">
                <input name="message" class="grow" placeholder="anything you want" />
                <button type="submit"><IconSend /></button>
              </label>
            </form>
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>
