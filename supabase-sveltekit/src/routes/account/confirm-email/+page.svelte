<script lang="ts">
  import { page } from "$app/stores"

  let confirmation_url = $page.url.searchParams.get("confirmation_url")
</script>

<div class="hero min-h-screen bg-base-200">
  <div class="hero-content text-center">
    <div class="max-w-md">
      <h1 class="text-5xl font-bold">Click here to confirm</h1>
      <!-- <p class="py-6">Provident cupiditate voluptatem et in. Quaerat fugiat ut assumenda excepturi exercitationem quasi. In deleniti eaque aut repudiandae et a id nisi.</p> -->
      <a class="btn btn-primary" href={confirmation_url}>Get Started</a>
    </div>
  </div>
</div>
