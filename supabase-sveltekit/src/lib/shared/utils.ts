import type { Notess, SupabaseClient } from '$lib/shared/first';
import { array as A } from 'fp-ts';
import type { Option } from 'fp-ts/lib/Option';
import { option as O } from 'fp-ts';
import { identity, pipe } from 'fp-ts/lib/function';
import type { Notes } from '$lib/dbtypes';

export let delete_by_id = (id: number) => A.filter((v: { id: number }) => v.id !== id);

export function logIfError<T extends { error: any }>(r: T): T {
	const { error } = r;
	error && console.log('error from logIfError util function\n', error);
	return r;
}

export async function getNotes(
	supabase: SupabaseClient,
	source_id: Option<number>,
	user_id: string,
	prevnotes = []
): Promise<Notess> {
	let q = supabase.from('notes').select('*, sources (title)').eq('user_id', user_id);
	q = pipe(
		source_id,
		O.match(
			() => q,
			(id) => q.eq('source_id', id)
		)
	);
	const { data } = await q;
	if (data === null) return prevnotes;

	return data.map(
		(v) =>
			pipe(
				v.sources,
				O.fromNullable,
				O.chain((v) => O.fromNullable(v.title)),
				O.fold(() => 'missing Title', identity),
				(title) => ({ ...v, sources: { title } })
			)

		// const _sources= match(sources)
		// 	.with(null, () => ({ title: 'missing Title' }))
		// 	.with({ title: null }, () => ({ title: 'missing Title' }))
		// 	.with({ title: P.select() }, (title) => ({ title }))
		// 	.exhaustive();
	);
}
