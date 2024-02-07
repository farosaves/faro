import { persisted } from 'svelte-persisted-store';
import type { SupabaseClient } from './shared/first';
import type { Notes } from './dbtypes';
import { logIfError } from './shared/utils';
import { derived, get, type Writable } from 'svelte/store';
import { getNotes } from './utils';

// First param `preferences` is the local storage key.
// Second param is the initial value.
const _scratches: { [id: string]: string } = {
	'pl.wikipedia.org;Kalanchoe': 'hey'
};

export const scratches = persisted('scratches', _scratches);

const __source_ids: { [id: string | symbol]: number } = {
	'pl.wikipedia.org;Kalanchoe': 15
};
const _source_ids = new Proxy(__source_ids, {
	get: (target, name) => (name in target ? target[name] : -1)
});
const source_ids = persisted('source_ids', _source_ids);

let _update = async (sb: SupabaseClient, domain: string, title: string) => {
	const id = [domain, title].join(';');
	const { data, error } = await sb
		.from('sources')
		.select('id')
		.eq('domain', domain)
		.eq('title', title)
		.maybeSingle();
	if (!data) {
		console.log('source not there yet probably', error);
		return -1;
	}
	source_ids.update((n) => {
		n[id] = data.id;
		return n;
	});
};

export let getSourceId = (sb: SupabaseClient) => async (domain: string, title: string) => {
	const id = [domain, title].join(';');
	if (!(id in get(source_ids)))
		source_ids.update(n => {n[id] = -1; return n})
	_update(sb, domain, title).then(console.log)
	return derived(source_ids, (n) => n[id]);
};
