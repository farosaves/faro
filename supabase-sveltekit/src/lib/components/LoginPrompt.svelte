<script lang="ts">
  import type { Session } from "@supabase/supabase-js";
  import { type Option, isNone } from "fp-ts/lib/Option";

  export let session: Option<Session>;
</script>

{#if isNone(session)}
  <div role="alert" class="alert alert-error">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="stroke-current shrink-0 h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      ><path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    <span>Not logged in! <a class="underline" href="login">Click here</a></span>
  </div>
{/if}
