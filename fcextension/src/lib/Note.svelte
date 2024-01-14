<script lang="ts">
	const DOMAIN = 'http://localhost:5173';
	import type { Session } from '@supabase/gotrue-js';
	import type { SupabaseClient } from '$lib/first';
	import type { MouseEventHandler } from 'svelte/elements';
	import type { Notes } from './dbtypes';

	export let note_data: Notes;
	export let showing_content: boolean;
	export let fun: MouseEventHandler<any>;
	export let deleteit: MouseEventHandler<any>;
	let replacer = (capture: string) => `<b class="text-yellow-400">` + capture + `</b>`;
	$: text = note_data.highlights
		? note_data.quote.replaceAll(note_data.highlights[0], replacer)
		: note_data.quote;
</script>

<div class="collapse bg-base-200">
	<input type="checkbox" bind:checked={showing_content} on:click={fun} />
	<div class="collapse-title text-center" style="font-size: 0.95rem; padding: 0.5rem">
		{@html text}
	</div>
	<div class="collapse-content flex content-center">
		<button class="btn btn-xs w-full" style="color: red;" on:click={deleteit}>DELETE</button>
		<!-- <ul class="flex flex-col">
			{#each qas.entries() as [index, { front, back, is_accepted: previously_accepted }]}
				<li class="flex flex-row">
					<button class="btn">{index + 1}. </button>
					<div class="flex flex-col">
						<span>{front}</span><span>{back}</span>
						<div class="flex flex-row">
							all of this stuff is just soo crazy, like there should just be a bin button, and mby a big undo button if worried about accidental deletions
							but making new ones is easy so even that is not an issue

							{#if !qas_accepted[index] && !qas_rejected[index] && !previously_accepted}
								<button class="btn w-auto" style="color:green" on:click={accept(index)}>
									Accept</button
								>
								<button class="btn w-auto" style="color:red" on:click={reject(index)}>
									Reject</button
								>
							{:else if !previously_accepted}
								<button
									class="btn w-auto"
									style="color:{qas_accepted[index] ? 'green' : 'red'}"
									on:click={accept_reject_undo(index)}
								>
									{qas_accepted[index] ? 'Accepted' : 'Rejected'}<br />(undo)</button
								>
							{/if}
						</div>
					</div>
				</li>
			{/each}
		</ul> -->
	</div>
</div>
