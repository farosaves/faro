<div class="m-auto max-w-5xl md">
  <slot />
</div>

<style>
  .md :global(h1) {
    margin-top: 1rem;
    margin-bottom: 1rem;
    font-size: xx-large;
    text-align: center;
    font-weight: 700;
  }
  .md :global(h2) {
    margin-top: 1rem;
    margin-bottom: 0.1rem;
    font-size: xx-large;
    margin-left: 2rem;
  }
  .md :global(h3) {
    font-size: x-large;
    margin-left: 2rem;
  }
</style>
