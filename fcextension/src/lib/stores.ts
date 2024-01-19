import { persisted } from 'svelte-persisted-store';

// First param `preferences` is the local storage key.
// Second param is the initial value.
var _scratches: { [id: string]: string } = {
	'pl.wikipedia.org;Kalanchoe': 'hey'
};

export const scratches = persisted('scratches', _scratches);
scratches.set(_scratches);
