import { persisted } from 'svelte-persisted-store';
import type { SupabaseClient } from './shared/first';
import type { Notes } from './dbtypes';
import { derived, get, type Subscriber, type Updater, type Writable } from 'svelte/store';
import type { NoteSync } from './shared/note-sync';

// First param `preferences` is the local storage key.
// Second param is the initial value.

class SBWriteStore<T> {
	sb: SupabaseClient;
	store: Writable<T>;
	user_id: string | undefined
	constructor(sb: SupabaseClient, user_id: string | undefined, p: Writable<T>) {
		this.sb = sb;
		this.store = p;
		this.user_id = user_id;
	}
	
}

export const scratches = persisted('scratches', new Map<string, string>());

const __source_ids: { [id: string | symbol]: number } = {
	'pl.wikipedia.org;Kalanchoe': 15
};
const _source_ids = new Proxy(__source_ids, {
	get: (target, name) => (name in target ? target[name] : -1)
});
const source_ids = persisted('source_ids', _source_ids);

export let sub = (note_sync: NoteSync) => (title: string, url: string) => {
	let update_source_ids = (sb: SupabaseClient) => async (nn: Notes) => {
		const { data, error } = await sb
			.from('sources')
			.select('domain, title')
			.eq('id', nn.source_id)
			.maybeSingle();
		if (!data) return;
		const id = [data.domain, data.title].join(';');
		source_ids.update((n) => {
			n[id] = nn.source_id;
			return n;
		});
	};
	
	note_sync.sb
		.channel('notes')
		.on(
			'postgres_changes',
			{
				event: 'INSERT',
				schema: 'public',
				table: 'notes',
				filter: `user_id=eq.${note_sync.user_id}`
			}, // at least url should be the same so no need to filter
			(payload: { new: Notes }) => {
				const nn = payload.new;
				console.log('received new', nn.quote);
				update_source_ids(note_sync.sb)(nn);
				note_sync.notestore.update((n) => {
					let id = nn.source_id;
					n[id] = n[id] || []; // ensure filter possible
					// get rid of optimistic insert
					n[id] = n[id].filter((n) => n.snippet_uuid !== nn.snippet_uuid);
					n[id] = [...n[id], { ...nn, sources: { title, url } }];
					return n;
				});
			}
		)
		.subscribe();
};


export let getSourceId = (sb: SupabaseClient) => async (domain: string, title: string) => {
	let query = async (sb: SupabaseClient, domain: string, title: string) => {
		const id = [domain, title].join(';');
		const { data, error } = await sb
			.from('sources')
			.select('id')
			.eq('domain', domain)
			.eq('title', title)
			.maybeSingle();
		if (!data) {
			console.log('source not there yet probably', error);
			return;
		}
		source_ids.update((n) => {
			n[id] = data.id;
			return n;
		});
	};
	
	const id = [domain, title].join(';');
	if (!(id in get(source_ids)))
		source_ids.update((n) => {
			n[id] = -1;
			return n;
		});
	query(sb, domain, title).then(() => console.log('updated sid'));
	return derived(source_ids, (n) => n[id]);
};
