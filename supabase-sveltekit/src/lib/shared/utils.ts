import { array as A } from 'fp-ts';

export let delete_by_id = (id: number) => A.filter((v: { id: number }) => v.id !== id);

export function logIfError<T extends { error: any }>(r: T): T {
	const { error } = r;
	error && console.log('error from logIfError util function\n', error);
	return r;
}
