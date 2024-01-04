<script>
  export let showing_answer = false;
  let show_answer = () => (showing_answer = true);
  export let intervals = ["<5m", "10m", "1d", "4d"];
</script>

{#if !showing_answer}
  <div class="flex flex-col space-y-4">
    <button class="btn btn-primary max-w" on:click={show_answer}> Show</button>
  </div>
{:else}
  <div class="flex" v-if="show">
    <div class="tooltip flex-1" data-tip="shortcut: 1️⃣">
      <button class="btn" style="color: red; width: 100%">
        {intervals[0]}<br />Again
      </button>
    </div>
    <div class="tooltip flex-1" data-tip="shortcut: 2️⃣">
      <button class="btn flex-1" style="color: white; width: 100%">
        {intervals[1]}<br />Hard
      </button>
    </div>
    <div class="tooltip flex-1" data-tip="shortcut: 3️⃣">
      <button class="btn flex-1" style="color: green; width: 100%">
        {intervals[2]}<br />Good
      </button>
    </div>
    <div class="tooltip flex-1" data-tip="shortcut: 4️⃣">
      <button class="btn flex-1" style="color: blue; width: 100%">
        {intervals[3]}<br />Easy
      </button>
    </div>
  </div>
{/if}
