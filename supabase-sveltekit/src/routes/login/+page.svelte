<script lang="ts">
  import { ThemeSupa, type ViewType } from "@supabase/auth-ui-shared";
  import { Auth } from "@supabase/auth-ui-svelte";
  export let data;
  import Radio from "$lib/Radio.svelte";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  let view: ViewType = "magic_link";
  let view_options = ["sign_in", "sign_up", "magic_link", "forgotten_password"];
  let providers = ["github"];
  onMount(() =>
    data.supabase.auth.onAuthStateChange(async (event, session) => {
      if (event == "SIGNED_IN") {
        console.log(session);
        data.session = session;
        // if (sessData.session) data
        setTimeout(() => {
          goto("/account");
        }, 50);
      }
    }),
  );
</script>

<svelte:head>
  <title>Faros - Login</title>
</svelte:head>

<div class="flex justify-center">
  <div class="w-64">
    <!-- border-dotted border-gray-500 border-2 -->
    <Auth
      supabaseClient={data.supabase}
      redirectTo={`${data.url}/auth/callback?view=${view}`}
      showLinks={false}
      view={view == "sign_up" ? "magic_link" : view}
      appearance={{ theme: ThemeSupa, style: { input: "color: #fff" } }} />
    <!-- <Auth supabaseClient={data.supabase} {view} {providers} /> -->
    <Radio options={view_options} bind:userSelected={view} />
  </div>
</div>
