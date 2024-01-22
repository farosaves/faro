<script>
	export let llm = 'Default LLM';
	export let topText = 'Top section text';
	export let bottomText = 'Bottom section text';
</script>

<div class="card w-96 bg-base-100 shadow-xl">
	<div class="card-body">
		<h2 class="card-title">{llm}</h2>
		<p>{topText}</p>
	</div>
	<hr class="border-gray-300" />
	<!-- Divider line -->
	<div class="card-body">
		<p>{bottomText}</p>

		<div class="mt-4">
			<label for="responseRating" class="mb-2">Response rating</label>
			<input
				type="range"
				id="responseRating"
				min="0"
				max="100"
				value="25"
				class="range"
				step="25"
			/>

			<div class="w-full flex justify-between text-xs px-2">
				<span>|</span>
				<span>|</span>
				<span>|</span>
				<span>|</span>
				<span>|</span>
			</div>
		</div>
	</div>
</div>
