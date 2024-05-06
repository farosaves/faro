<script lang="ts">
  export let form
</script>

{#if form?.success}<div class="collapse collapse-close bg-base-100">
    <div class="collapse-title text-xl font-medium text-center p-4">All set, thx!</div>
  </div>
{:else}
  <div class="collapse bg-base-100">
    <input type="checkbox" />
    <div class="collapse-title text-xl font-medium text-center p-4">Get emailed when goes live</div>
    <div class="collapse-content mx-4">
      <form method="POST">
        <label class="input input-bordered flex items-center gap-2">
          <!-- <IconEnvelope /> -->
          <input name="email" type="email" class="grow" placeholder="Email" />
          <button hidden type="submit"></button>
        </label>
      </form>
    </div>
  </div>
{/if}
