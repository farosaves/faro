<script>
  let cnt = 1;
</script>

<h1>Welcome to SvelteKit</h1>
<p>
  Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation
</p>
<button class="btn btn-primary" on:click={() => (cnt += 1)}
  >Hello daisyUI</button
>
<p>{cnt}</p>
