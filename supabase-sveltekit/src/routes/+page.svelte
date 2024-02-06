<script lang="ts">
	import { ThemeSupa, type ViewType } from '@supabase/auth-ui-shared';
	import { Auth } from '@supabase/auth-ui-svelte';
	// import Auth from 'supabase-ui-svelte';
	import '../styles.css';
	export let data;
	import Radio from '$lib/Radio.svelte';
	let view = 'magic_link';
	let view_options = ['sign_in', 'sign_up', 'magic_link', 'forgotten_password'];
	let providers = ['github'];
</script>

<svelte:head>
	<title>User Management</title>
</svelte:head>

<div class="flex row flex-center">
	<div class="col-6 form-widget">
		<Auth
			supabaseClient={data.supabase}
			redirectTo={`${data.url}/auth/callback`}
			showLinks={false}
			{view}
			appearance={{ theme: ThemeSupa, style: { input: 'color: #fff' } }}
		/>
		<!-- <Auth supabaseClient={data.supabase} {view} {providers} /> -->
		<Radio options={view_options} bind:userSelected={view} />
	</div>
</div>
