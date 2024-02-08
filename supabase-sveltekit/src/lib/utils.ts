import { Card } from 'fsrs.js';

export function ts(card: Card) {
	return { ...card, due: card.due.toString(), last_review: card.last_review.toString() };
}
