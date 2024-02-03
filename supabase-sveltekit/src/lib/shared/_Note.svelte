<script lang="ts">
	import type { MouseEventHandler } from 'svelte/elements';
	import type { Notes } from '../dbtypes';
	import Tags from './Tags.svelte';
	export let note_data: Notes;
	export let showing_content: boolean;
	export let close_all_notes: MouseEventHandler<any>;
	export let ondelete: MouseEventHandler<any>;
	export let goto_function: MouseEventHandler<any> | undefined;
	let tags: string[] = [];
	$: all_tags = tags.concat(['hey', 'whoa']);
	let replacer = (capture: string) => `<b class="text-yellow-200">` + capture + `</b>`;
	$: text = note_data.highlights
		? note_data.quote.replaceAll(note_data.highlights[0], replacer)
		: note_data.quote;
</script>

<div class="collapse bg-base-200">
	<input type="checkbox" bind:checked={showing_content} on:click={close_all_notes} />
	<div
		class="collapse-title text-center"
		style="font-size: 0.95rem; padding: 0.5rem; grid-column-start:1"
	>
		{@html text}
	</div>
	<div class="collapse-content z-40">
		<Tags bind:tags autoComplete={all_tags} onlyUnique={true} />
		<div class="join w-full">
			<button class="btn btn-xs join-item grow" on:click={goto_function}>nth</button>
			<button class="btn btn-xs join-item grow" style="color: red;" on:click={ondelete}
				>DELETE</button
			>
		</div>
	</div>
</div>
