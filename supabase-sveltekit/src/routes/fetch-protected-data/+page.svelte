<script lang="ts">
  import { onMount } from "svelte";

  let protectedData = "";
  let loading = false;
  let error = "";

  async function fetchProtectedData() {
    loading = true;
    error = "";
    try {
      const response = await fetch("/api/test");
      if (response.ok) {
        const data = await response.json();
        protectedData = data.data;
      } else {
        error = "Failed to fetch protected data: Access Denied";
      }
    } catch (err: any) {
      error = `Error: ${err.message}`;
    }
    loading = false;
  }

  onMount(fetchProtectedData);
</script>

<div class="container">
  <h1>Fetch Protected Data</h1>
  <button
    on:click={fetchProtectedData}
    class="btn btn-primary"
    disabled={loading}>
    {loading ? "Loading..." : "Fetch Data"}
  </button>
  {#if error}
    <div class="alert alert-danger">{error}</div>
  {/if}
  {#if protectedData}
    <div class="alert alert-success">
      <strong>Protected Data:</strong>
      {protectedData}
    </div>
  {/if}
</div>
