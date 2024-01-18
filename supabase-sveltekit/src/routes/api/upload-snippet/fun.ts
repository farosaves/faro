import { array as A, option as O } from 'fp-ts';
import { flow } from 'fp-ts/lib/function';
import { split } from 'sentence-splitter';

let tooLong = (s: string) => split(s).filter((s) => s.raw.length > 4).length > 10;
let longEnough = (s: string) => split(s).filter((s) => s.raw.length > 4).length > 1;
let isValidQuote = (s: string) => longEnough(s) && !tooLong(s);
let firstValid = flow(A.findLast(isValidQuote), O.toUndefined); // TODO: this can make problems
let iou = (s1: string) => (s2: string) =>
	new Set(...s1.split(' ').filter((x) => new Set(...s2.split(' ')).has(x))).size /
	new Set([...s1.split(' '), ...s2.split(' ')]).size;
// let a = Set(s1), b= Set(s2); length(a ∪ b)/length(a ∩ b) end in julia for comparison lol

// Quote Context Highlights
export function makeQCH(selectedText: string, contextTexts: string[]) {
	const regex_cit = /\[\d{1,2}\]/gu;
	selectedText = selectedText.replaceAll('&quot;', '"').replaceAll(regex_cit, '');
	const context = firstValid(contextTexts)!;
	const highlights = !longEnough(selectedText) ? [selectedText] : [];
	let quote: string;
	if (longEnough(selectedText)) quote = selectedText;
	else {
		let potential_quotes = split(context.replaceAll(regex_cit, ''))
			.map((x) => x.raw)
			.filter((x) => x.includes(selectedText))
			.toSorted(iou(contextTexts[0]));
		potential_quotes = // this is a hacky fallback..
			potential_quotes ||
			split(context.replaceAll(regex_cit, ''))
				.map((x) => x.raw)
				.toSorted(iou(selectedText));
		quote = potential_quotes.findLast(() => true)!;
	}
	return { quote, highlights, context };
}
