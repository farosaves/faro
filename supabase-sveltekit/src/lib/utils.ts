import { Card } from 'fsrs.js';
import {JSDOM} from 'jsdom'

export function ts(card: Card) {
	return { ...card, due: card.due.toUTCString(), last_review: card.last_review.toUTCString() };
}

export const htmlstr2body = (h: string) => new JSDOM(h).window.document.body
