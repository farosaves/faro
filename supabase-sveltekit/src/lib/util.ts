import { Card } from 'fsrs.js';

export function ts(card: Card) {
    return {...card, due: card.due.toString(), last_review: card.last_review.toString()}
}

export function logIfError<T extends { error: any }>(r: T): T {
	const { error } = r;
	error && console.log('error from logIfError util function\n', error);
	return r;
}
