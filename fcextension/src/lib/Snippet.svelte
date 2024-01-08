<script lang="ts">
	const DOMAIN = 'http://localhost:5173';
	import type { Session } from '@supabase/gotrue-js';
	import type { CardContentData, SnippetData, SupabaseClient } from '$lib/first';
	import { onMount } from 'svelte';
	let qas_accepted = [false, false];
	let qas_rejected = [false, false];
	let card_ids = [null, null];

	export let ss: { supabase: SupabaseClient; session: Session };
	export let snippet_data: SnippetData;
	let session = ss.session;
	let supabase = ss.supabase;
	let qas: CardContentData[] = [];
	onMount(async () => {
		const { data } = await supabase
			.from('card_contents')
			.select()
			.eq('snippet_id', snippet_data.id);
		console.log(data);
		qas = data || [];
	});

	function reject(n) {
		return () => {
			qas_rejected[n] = true;
			qas_accepted[n] = false;
		};
	}
	function accept(n) {
		return async () => {
			const { error } = await supabase
				.from('cards')
				.update({ is_active: true })
				.eq('id', card_ids[n]);
			console.log(error);
			qas_rejected[n] = false;
			qas_accepted[n] = true;
		};
	}
	function accept_reject_undo(n) {
		return async () => {
			const { error } = await supabase
				.from('cards')
				.update({ is_active: false })
				.eq('id', card_ids[n]);
			console.log(error);
			qas_rejected[n] = false;
			qas_accepted[n] = false;
		};
	}
	// export let showing_contents = [false, false];
	// export let id = 0;
	export let showing_content: boolean;
	export let fun: Function;
</script>

<div class="collapse bg-base-200">
	<input type="checkbox" bind:checked={showing_content} on:click={fun} />
	<div class="collapse-title text-center" style="font-size: 0.95rem; padding: 0.5rem">
		{snippet_data.snippet_text}
	</div>
	<div class="collapse-content">
		<ul class="flex flex-col">
			{#each qas.entries() as [index, { front, back }]}
				<li class="flex flex-row">
					<button class="btn">{index + 1}. </button>
					<div class="flex flex-col"><span>{front}</span><span>{back}</span></div>
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
