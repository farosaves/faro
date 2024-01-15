import { persisted } from 'svelte-persisted-store';

// First param `preferences` is the local storage key.
// Second param is the initial value.
export const scratches = persisted('scratches', {
	'pl.wikipedia.org': {
		Kalanchoe: 'hey'
	}
});
