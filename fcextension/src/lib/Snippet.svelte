<script lang="ts">
	const DOMAIN = 'http://localhost:5173';
	import type { Session } from '@supabase/gotrue-js';
	import type { SupabaseClient } from '$lib/first';
	import { onMount } from 'svelte';
	import type { MouseEventHandler } from 'svelte/elements';
	import type { CardContents, Snippets } from './dbtypes';
	let qas_accepted: boolean[] = [];
	let qas_rejected: boolean[] = [];

	export let ss: { supabase: SupabaseClient; session: Session };
	export let snippet_data: Snippets;
	let session = ss.session;
	let supabase = ss.supabase;
	let qas: CardContents[] = [];
	async function qasinit() {
		const { data } = await supabase
			.from('card_contents')
			.select()
			.eq('snippet_id', snippet_data.id)
			.eq('is_rejected', false);
		console.log(data);
		qas = data || [];
		qas_accepted = qas.map((v) => v.is_accepted);
		qas_rejected = qas.map((v) => v.is_rejected);
	}
	onMount(qasinit);
	function decide(n: number, is_accepted: boolean, is_rejected: boolean) {
		return async () => {
			const ret = await supabase
				.from('card_contents')
				.update({ is_accepted, is_rejected })
				.eq('id', qas[n].id);
			qas_rejected[n] = is_rejected;
			qas_accepted[n] = is_accepted;
		};
	}
	function reject(n: number) {
		return decide(n, false, true);
	}
	function accept(n: number) {
		return decide(n, true, false);
	}
	function accept_reject_undo(n: number) {
		return decide(n, false, false);
	}
	export let showing_content: boolean;
	export let fun: MouseEventHandler<any>;
</script>

<div class="collapse bg-base-200">
	<input type="checkbox" bind:checked={showing_content} on:click={fun} />
	<div class="collapse-title text-center" style="font-size: 0.95rem; padding: 0.5rem">
		{snippet_data.snippet_text}
	</div>
	<div class="collapse-content">
		<ul class="flex flex-col">
			{#each qas.entries() as [index, { front, back, is_accepted: previously_accepted }]}
				<li class="flex flex-row">
					<button class="btn">{index + 1}. </button>
					<div class="flex flex-col">
						<span>{front}</span><span>{back}</span>
						<div class="flex flex-row">
							<!-- all of this stuff is just soo crazy, like there should just be a bin button, and mby a big undo button if worried about accidental deletions
							but making new ones is easy so even that is not an issue -->
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
		</ul>
	</div>
</div>
<!-- 
<span
  class="block p-4 my-2 bg-blue-500 text-white hover:bg-blue-600 rounded-md"
  on:click={() => {
    showing_cards = !showing_cards;
  }}>{text}</span
>
{#if showing_cards}
  <div class="overflow-x-auto">
    <table class="table">
      <thead>
        <tr>
          <th></th>
          <th>Question</th>
          <th>Answer</th>
        </tr>
      </thead>
      <tbody>
        {#each qas.entries() as [index, [question, answer]]}
          <tr>
            <th>{index + 1}</th>
            <td>{question}</td>
            <td>{answer}</td>
            <td class="flex flex-col">
              {#if !qas_accepted[index] && !qas_rejected[index]}
                <button class="btn w-full" style="color:green" on:click={accept(index)}> Accept</button>
                <button class="btn w-full" style="color:red" on:click={reject(index)}> Reject</button>
              {:else}
                <button
                  class="btn w-full"
                  style="color:{qas_accepted[index] ? 'green' : 'red'}"
                  on:click={accept_reject_undo(index)}
                >
                  {qas_accepted[index] ? "Accepted" : "Rejected"}<br />(undo)</button
                >
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{/if} -->
