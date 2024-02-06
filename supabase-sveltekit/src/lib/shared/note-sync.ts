// @ts-ignore
import { persisted } from 'svelte-persisted-store';
import type { Notes } from '../dbtypes';
import type { Notess, SupabaseClient } from './first';
import { derived, get, type Writable } from 'svelte/store';
import { delete_by_id, getNotes, logIfError } from './utils';
import { option as O, array as A, record as R, task as T } from 'fp-ts';
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
	alltags = () =>
		derived(this.notestore, (v) =>
			Object.entries(v).flatMap(([_, notess]) => notess.flatMap((n) => n.tags || []))
		);

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
				Object.entries(kvs), // @ts-ignore
				A.map(([k, v]) => [v[0].sources.title, v]),
				R.fromEntries<Notess>,
				R.toArray<string, Notess>
			)
		);
	}

	addit = async (n: Notes) => {
		const foo = 'asdf' // string
		const bar = T.of(foo) // T.Task<string>
		const m = async (a: number) => a+a
		const barr = T.of(m)
		let s = (await barr())(1)

		const cache = get(this.notestore)[n.source_id];
		const title = cache
			? cache[0].sources.title
			: (await this.sb.from('sources').select().eq('id', n.source_id).maybeSingle()).data?.title ||
				'missing Title';

		this.notestore.update((s) => {
			s[n.source_id] = [...s[n.source_id], { ...n, sources: { title } }];
			return s;
		});
		this.sb.from('notes').insert(n).then(logIfError).then(this._restoreIE(n, cache));
	};

	deleteit = (n: Notes) => {
		const cache = get(this.notestore)[n.source_id];

		this.notestore.update((s) => {
			s[n.source_id] = delete_by_id(n.id)(s[n.source_id]);
			return s;
		});
		this.sb.from('notes').delete().eq('id', n.id).then(logIfError).then(this._restoreIE(n, cache));
	};
	// @ts-ignore
	_restoreIE = (n: Notes, cache: Notess) => (r) =>
		r.error &&
		this.notestore.update((s) => {
			s[n.source_id] = cache;
			return s;
		});

	tagUpdate = (note: Notes) => (tag: string, tags: string[]) => {
		console.log(note.highlights);
		this.notestore.update((n) => {
			n[note.source_id].filter((_note) => _note.id == note.id)[0].tags = tags;
			return n;
		});
		this.sb.from('notes').update({ tags }).eq('id', note.id).then(logIfError);
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
