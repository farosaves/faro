import { Card } from 'fsrs.js';


export function ts(card: Card) {
	return { ...card, due: card.due.toUTCString(), last_review: card.last_review.toUTCString() };
}

