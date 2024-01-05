<script>
	const DOMAIN = 'http://localhost:5173';
	export let data;
	let { supabase } = data;
	$: ({ supabase } = data);

	let n_cards = 2;
	let qas = [
		['Kto ty jestes? ', 'Polak maly'],
		['Jaki znak twoj?', 'Orzel bialy']
	];
	let qas_accepted = [false, false];
	let qas_rejected = [false, false];
	let card_ids = [null, null];
	let website_title = 'Chick flick';
	let link = 'https://en.wikipedia.org/wiki/Chick_flick';
	let text =
		'Women are typically portrayed in chick flicks as sassy, noble victims, or klutzy twentysomethings. Romantic comedies (rom-coms) are often also chick flicks. However, rom-coms are typically respected more than chick flicks because they are designed to appeal to men and women.';

	let snippet_id = undefined;

	async function callapi() {
		const response = await fetch(`${DOMAIN}/api/make-flashcard`, {
			method: 'POST',
			body: JSON.stringify({ n_cards, text, website_title, link }),
			headers: {
				'content-type': 'application/json'
			}
		});
		let ret = await response.json();
		qas = ret.qas;
		snippet_id = ret.snippet_id;
		card_ids = ret.card_ids;
		qas_accepted = card_ids.map((x) => false);
		qas_rejected = card_ids.map((x) => false);
		console.log(qas);
	}
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
</script>

<!-- <h1>All sites sidepanel extension</h1>
<p>This side panel is enabled on all sites</p>
<p class="text-2xl">tailwind test ( works fine)</p>
<button class="btn btn-primary">daisy test</button> -->

{data.session?.user.email}
{card_ids.join(' ')}
<div class="col-6 form-widget">
	<input class="text-xl" bind:value={website_title} />
	<input class="resize" bind:value={text} />

	<div class="overflow-x-auto">
		<table class="table">
			<!-- head -->
			<thead>
				<tr>
					<th></th>
					<th>Question</th>
					<th>Answer</th>
				</tr>
			</thead>
			<tbody>
				<!-- row 1 -->
				{#each qas.entries() as [index, [question, answer]]}
					<tr>
						<th>{index + 1}</th>
						<td>{question}</td>
						<td>{answer}</td>
						<td class="flex flex-col">
							{#if !qas_accepted[index] && !qas_rejected[index]}
								<button class="btn w-full" style="color:green" on:click={accept(index)}>
									Accept</button
								>
								<button class="btn w-full" style="color:red" on:click={reject(index)}>
									Reject</button
								>
							{:else}
								<button
									class="btn w-full"
									style="color:{qas_accepted[index] ? 'green' : 'red'}"
									on:click={accept_reject_undo(index)}
								>
									{qas_accepted[index] ? 'Accepted' : 'Rejected'}<br />(undo)</button
								>
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<!-- <span class="text-center">{res}</span> -->
	<button on:click={callapi}>Replicate test</button>
	<button
		on:click={async () => {
			await fetch(`${DOMAIN}/api/my-email`, {
				method: 'POST',
				body: JSON.stringify({ n_cards }),
				headers: {
					'content-type': 'application/json'
				}
			});
		}}>ayy</button
	>
</div>
