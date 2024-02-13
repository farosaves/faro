<script>
	import List from './List.svelte';
	let items1 = [
		{ id: 1, title: 'I' },
		{ id: 2, title: 'Am' },
		{ id: 3, title: 'Yoda' }
	];
	let items2 = [
		{ id: 4, title: 'Luke' },
		{ id: 5, title: 'Skywalker' }
	];
	let items3 = [
		{ id: 1, title: 'Emperor' },
		{ id: 2, title: 'Palpatine' },
		{ id: 3, title: 'Death' },
		{ id: 4, title: 'Star' }
	];
</script>

<h3>You can't mix the light side and the dark side</h3>
<p>
	Notice: you might experience strange issues when playing with this one in the REPL but it works
	fine locally. <br /> There is an
	<a href="https://github.com/isaacHagoel/svelte-dnd-action/issues/470">open issue</a> about this.
</p>
<hr />
<List items={items1} type="light" />
<hr />
<List items={items2} type="light" />
<hr />
<List items={items3} type="dark" />
