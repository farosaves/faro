import { persisted } from 'svelte-persisted-store';
import type { SupabaseClient } from './shared/first';
import type { Notes } from './dbtypes';
import { logIfError } from './shared/utils';
import { derived, type Writable } from 'svelte/store';
import { getNotes } from './utils';

// First param `preferences` is the local storage key.
// Second param is the initial value.
var _scratches: { [id: string]: string } = {
	'pl.wikipedia.org;Kalanchoe': 'hey'
};

export const scratches = persisted('scratches', _scratches);

