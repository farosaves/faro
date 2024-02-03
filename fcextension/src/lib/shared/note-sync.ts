import { persisted } from 'svelte-persisted-store';
import type { Notes } from '../dbtypes';
import type { SupabaseClient } from './first';
import { derived, get, type Writable } from 'svelte/store';
import { getNotes } from '../utils';
import { delete_by_id, logIfError } from './utils';

const notes: { [id: number]: Notes[] } = {};
export type NoteDict = typeof notes;
export const notestore = persisted('notestore', notes);

export class NoteSync {
	sb: SupabaseClient;
	notestore: Writable<{ [id: number]: Notes[] }>;
	user_id: string | null;
	constructor(sb: SupabaseClient, user_id: string | null) {
		this.sb = sb;
		this.notestore = notestore;
		this.user_id = user_id;
	}
	panel(id: number) {
		return derived(this.notestore, (v) => v[id]);
	}

	async update_one_page(id: number) {
		if (!this.user_id) {
			console.log('no user in NoteSync');
			return;
		}
		const newnotes = await getNotes(this.sb, id, this.user_id);
		if (newnotes !== null)
			this.notestore.update((s) => {
				s[id] = newnotes;
				return s;
			});
	}

	deleteit = (n: Notes) => async () => {
		let { error } = await this.sb.from('notes').delete().eq('id', n.id).then(logIfError);
		if (error) return;
		this.notestore.update(s => {s[n.source_id] = delete_by_id(n.id)(s[n.source_id]); return s})
	};


	sub() {
		this.sb
			.channel('notes')
			.on(
				'postgres_changes',
				{
					event: 'INSERT',
					schema: 'public',
					table: 'notes',
					filter: `user_id=eq.${this.user_id}`
				}, // at least url should be the same so no need to filter
				(payload: { new: Notes }) => {
                    this.notestore.update((n) => {let id = payload.new.source_id; n[id] = [...n[id], payload.new]; return n})
                }
			)
			.subscribe();
	}
}
