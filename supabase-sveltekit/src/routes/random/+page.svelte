<script lang="ts">
	import Fuse from 'fuse.js';
	import { onMount } from 'svelte';

	// select from 0th child of <p> to the last child
	onMount(() => document.getSelection().setBaseAndExtent(p, 0, p, p.childNodes.length));

	let list = [
		'Yoga with Adriene - Revolution',
		'Brewdog beers',
		'NBA teams seen live',
		'Yoga with Adriene - DEDICATE - 30 days',
		'Yoga with Adriene - home'
	];
	const options = {
		isCaseSensitive: false,
		includeScore: true,
		shouldSort: true
	};

	const fuse = new Fuse(list, options);

	// Change the pattern
	const pattern = 'yoga home';
	console.log(fuse.search(pattern));
	// 2. Files import automatically: uncomment this
	// msg = capitalize(msg)

	// $('#header')
	// 	.html(msg)
	// 	// 3. Smart autocomplete: type .fadeIn('slow')
	// 	// after .fadeOut('slow')
	// 	.fadeOut(1000);
</script>

<p id="p">Select me: <i>italic</i> and <b>bold</b></p>
