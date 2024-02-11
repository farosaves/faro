<!-- src/routes/account/+page.svelte -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { onMount } from 'svelte';

	export let data;
	export let form;

	let { session, supabase, profile } = data;
	$: ({ session, supabase, profile } = data);

	let profileForm: HTMLFormElement;
	let loading = false;
	let fullName: string = profile?.full_name ?? '';
	let username: string = profile?.username ?? '';
	let website: string = profile?.website ?? '';
	let avatarUrl: string = profile?.avatar_url ?? '';

	const handleSubmit: SubmitFunction = () => {
		loading = true;
		return async () => {
			loading = false;
		};
	};

	const handleSignOut: SubmitFunction = () => {
		loading = true;
		return async ({ update }) => {
			loading = false;
			update();
		};
	};
	// import LibLoader from '$lib/components/LibLoader.svelte';
	// // import u from 'main.wasm';
	// function onLoaded() {
	// 	// myExternalLib.doStuff();
	// 	console.log('loaded?');
	// }
	let ff: Function;
	onMount(async () => {
		const jsexports = {};
		const fetchPromise = fetch('main.wasm');
		const { instance } = await WebAssembly.instantiateStreaming(fetchPromise, jsexports);
		// @ts-ignore
		ff = instance.exports.peccatoribus;
	});
</script>

<button
	class="btn"
	on:click={() => {
		console.log(ff(2));
	}}>eee</button
>;
<!-- <LibLoader url="main.wasm" on:loaded={onLoaded} /> -->

<div class="flex items-center justify-center min-h-screen p-4 bg-neutral text-neutral-content">
	<div class="w-full max-w-xl p-10 card bg-base-300">
		<form
			class="space-y-6 form-control"
			method="post"
			action="?/update"
			use:enhance={handleSubmit}
			bind:this={profileForm}
		>
			<label class="input-group">
				<span>Email</span>
				<input
					type="text"
					value={session.user.email}
					class="w-full input input-bordered"
					disabled
				/>
			</label>

			<label class="input-group">
				<span>Full Name</span>
				<input
					type="text"
					name="fullName"
					class="w-full input input-bordered"
					value={form?.fullName ?? fullName}
				/>
			</label>

			<label class="input-group">
				<span>Username</span>
				<input
					type="text"
					name="username"
					class="w-full input input-bordered"
					value={form?.username ?? username}
				/>
			</label>

			<label class="input-group">
				<span>Website</span>
				<input
					type="url"
					name="website"
					class="w-full input input-bordered"
					value={form?.website ?? website}
				/>
			</label>

			<button type="submit" class="w-full btn btn-primary" disabled={loading}>
				{loading ? 'Loading...' : 'Update'}
			</button>

			<button
				type="submit"
				formaction="?/signout"
				class="w-full btn btn-secondary"
				disabled={loading}
			>
				Sign Out
			</button>
		</form>
	</div>
</div>
