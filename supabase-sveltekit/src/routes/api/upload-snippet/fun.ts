import { array as A, option as O } from 'fp-ts';
import { flow } from 'fp-ts/lib/function';
import { split } from 'sentence-splitter';

let tooLong = (s: string) => split(s).filter((s) => s.raw.length > 4).length > 10;
let longEnough = (s: string) => split(s).filter((s) => s.raw.length > 4).length > 1;
let isValid = (s: string) => longEnough(s) && !tooLong(s);
let firstValid = flow(A.findLast(isValid), O.toUndefined); // TODO: this can make problems

export function makeQuote(selectedText: string, contextText: string) {
	if (isValid(selectedText)) {
		return selectedText;
	}
	console.log(contextText, selectedText);
	const regex_cit = /\[\d{1,2}\]/u;
	const regex_post = /^([^\.!\?]|\.\d|\d\.|\.[^\.]\.|\w\.\w)+/u; // from the start
	const regex_pre = /([^\.\?]|\.\d|\d\.|\.[^\.]\.|\w\.\w)+$/u; // from the end
	let [pre, ...posts] = contextText.replace(regex_cit, '').split(selectedText);
	let post = posts.join(selectedText);
	let f = (v: RegExpMatchArray | null) => (v && v[0]) || '';
	return (f(pre.match(regex_pre)) + selectedText + f(post.match(regex_post))).trim() + '.';
	// return contextText.slice(pre, contextText.length-post)
}

// Quote Context Highlights
export function makeQCH(selectedText: string, contextTexts: string[]) {
	const context = firstValid(contextTexts)!;
	const highlights = !longEnough(selectedText) ? [selectedText] : [];
	const quote = makeQuote(selectedText, context);
	return { quote, highlights, context };
}
