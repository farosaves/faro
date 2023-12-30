<script>
	let n_cards = 2;
	let qas = [
		['Kto ty jestes? ', 'Polak maly'],
		['Jaki znak twoj?', 'Orzel bialy']
	];
	let website_title = 'Chick flick';
	let link = 'https://en.wikipedia.org/wiki/Chick_flick';
	let text =
		'Women are typically portrayed in chick flicks as sassy, noble victims, or klutzy twentysomethings. Romantic comedies (rom-coms) are often also chick flicks. However, rom-coms are typically respected more than chick flicks because they are designed to appeal to men and women.';

	async function callapi() {
		// qas = 'waiting...';
		const response = await fetch('/api/make-flashcard', {
			method: 'POST',
			body: JSON.stringify({ n_cards, text, website_title, link }),
			headers: {
				'content-type': 'application/json'
			}
		});

		qas = (await response.json()).qas;
		console.log(qas);
	}
</script>

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
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<!-- <span class="text-center">{res}</span> -->
	<button on:click={callapi}>Replicate test</button>
</div>
