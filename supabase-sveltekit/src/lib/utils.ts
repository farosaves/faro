import { Card } from 'fsrs.js';
import { array as A } from 'fp-ts';
import * as N from 'fp-ts/number'

export function ts(card: Card) {
	return { ...card, due: card.due.toString(), last_review: card.last_review.toString() };
}

function groupBy<T>(f: (a: T) => number) {
	return (arr: T[]) => {
		let keys = A.uniq(N.Eq)(A.map(f)(arr));
        A.map((key: number) => A.filter((v: T) => f(v)==key))(keys)
	};
}
// let filter = (f) => A.filter(f)