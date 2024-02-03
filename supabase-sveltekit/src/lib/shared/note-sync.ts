// @ts-ignore
import { persisted } from 'svelte-persisted-store';
import type { Notes } from '../dbtypes';
import type { Notess, SupabaseClient } from './first';
import { derived, get, type Writable } from 'svelte/store';
import { delete_by_id, getNotes, logIfError } from './utils';
import { option as O, array as A, record as R } from 'fp-ts';
import { groupBy } from 'fp-ts/lib/NonEmptyArray';
import { pipe } from 'fp-ts/lib/function';

const notes: { [id: number]: Notess } = {};
export type NoteDict = typeof notes;
export const notestore = persisted('notestore', notes);

export class NoteSync {
	sb: SupabaseClient;
	notestore: Writable<{ [id: number]: Notess }>;
	user_id: string | undefined;
	constructor(sb: SupabaseClient, user_id: string | undefined) {
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
		const newnotes = await getNotes(this.sb, O.some(id), this.user_id);
		if (newnotes !== null)
			this.notestore.update((s) => {
				s[id] = newnotes;
				return s;
			});
	}

	async update_all_pages() {
		if (!this.user_id) {
			console.log('no user in NoteSync');
			return;
		}
		const newnotes = await getNotes(this.sb, O.none, this.user_id);
		let groupnotes = (notes: Notess) =>
			pipe(
				notes,
				groupBy((n) => n.source_id.toString()),
				R.toArray
			);
		if (newnotes !== null)
			this.notestore.update((s) => {
				let grouped = groupnotes(newnotes);
				grouped.forEach(([x, notes]) => (s[notes[0].source_id] = notes));
				return s;
			});
	}

	get_groups() {
		return derived(this.notestore, (kvs) =>
			pipe(
				Object.entries(kvs),  // @ts-ignore
				A.map(([k, v]) => [v[0].sources.title, v]),
				R.fromEntries<Notess>,
				R.toArray<string, Notess>
			)
		);
		// 	A.map(([s, n]) => [s, n])
		// ))
		// Object.entries(kvs).map(([s, ns]) => [ns[1].sources.title, ns]))
	}

	deleteit = (n: Notes) => async () => {
		let { error } = await this.sb.from('notes').delete().eq('id', n.id).then(logIfError);
		if (error) return;
		this.notestore.update((s) => {
			s[n.source_id] = delete_by_id(n.id)(s[n.source_id]);
			return s;
		});
	};

	sub(title: string) {
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
					this.notestore.update((n) => {
						let id = payload.new.source_id;
						n[id] = [...n[id], { ...payload.new, sources: { title } }];
						return n;
					});
				}
			)
			.subscribe();
	}
}
