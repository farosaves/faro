<script lang="ts">
  let count: number = 0
  const increment = () => {
    count += 1
  }
</script>

<button class=" btn btn-sm btn-primary" on:click={increment}>
  count is {count}
</button>
