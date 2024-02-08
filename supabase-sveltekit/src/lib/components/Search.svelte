<script lang="ts">
	import type { Notes } from '$lib/dbtypes';
	import { array as A } from 'fp-ts';
	import Fuse from 'fuse.js';

	export let notes: (Notes & { sources: { title: string } })[];
	let query = '';
	let byTags = false;
	let byTitles = false;
	let byText = false;
	$: keys = [
		...(byTags ? ['tags'] : []),
		...(byTitles ? ['sources.title'] : []),
		...(byText ? ['quote'] : [])
	];
	$: fuse = new Fuse(notes, { keys, ignoreLocation: true });
	$: res = !!query && fuse.search(query);
	$: res && res.length && console.log(res[0].item.quote);
</script>

<form>
	<input type="text" placeholder="Type here" class="input w-full max-w-xs" bind:value={query} />
	<button hidden on:click={() => console.log(res, keys)}></button>
</form>
<div class="join">
	<label class="label cursor-pointer join-item">
		<span class="label-text">Tags</span>
		<input type="checkbox" bind:checked={byTags} class="checkbox" />
	</label>
	<label class="label cursor-pointer join-item">
		<span class="label-text">Titles</span>
		<input type="checkbox" bind:checked={byTitles} class="checkbox" />
	</label>
	<label class="label cursor-pointer join-item">
		<span class="label-text">Text</span>
		<input type="checkbox" bind:checked={byText} class="checkbox" />
	</label>
</div>
