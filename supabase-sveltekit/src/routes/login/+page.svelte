<script lang="ts">
  import { ThemeSupa, type ViewType } from "@supabase/auth-ui-shared";
  import { Auth } from "@supabase/auth-ui-svelte";
  // import '../../styles.css';
  export let data;
  import Radio from "$lib/Radio.svelte";
  let view: ViewType = "magic_link";
  let view_options = ["sign_in", "sign_up", "magic_link", "forgotten_password"];
  let providers = ["github"];
  // import { redirect } from '@sveltejs/kit';
  // import type { Session } from '@supabase/supabase-js';
  // let session: Session | null;
  // let updateSession = async () => {
  // 	({
  // 		data: { session }
  // 	} = await data.supabase.auth.getSession());
  // };
  // setInterval(updateSession, 500);
  // $: if (session) throw redirect(302, '/account');
</script>

<svelte:head>
  <title>Faros - Login</title>
</svelte:head>

<div class="flex justify-center">
  <div class="w-64">
    <!-- border-dotted border-gray-500 border-2 -->
    <Auth
      supabaseClient={data.supabase}
      redirectTo={`${data.url}/auth/callback`}
      showLinks={false}
      {view}
      appearance={{ theme: ThemeSupa, style: { input: "color: #fff" } }} />
    <!-- <Auth supabaseClient={data.supabase} {view} {providers} /> -->
    <Radio options={view_options} bind:userSelected={view} />
  </div>
</div>
