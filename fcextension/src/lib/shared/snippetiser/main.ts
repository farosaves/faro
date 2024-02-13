import { array as A, option as O, nonEmptyArray as NA, nonEmptyArray as nEA } from 'fp-ts';
import { identity, pipe } from 'fp-ts/lib/function';
import * as tok from 'sbd';
import { JSDOM } from 'jsdom';
import { error } from 'fp-ts/lib/Console';

type ArrOr1<T> = T[] | T;
function goUp(cond: (n: Element) => boolean, e: Element): Element {
	return cond(e.parentElement!) ? e.parentElement! : goUp(cond, e.parentElement!);
}
const sectiontags = new Set(['ul', 'h1', 'h3', 'h2', 'details'].map((x) => x.toUpperCase()));

const splittags = new Set(
	['ul', 'h1', 'h3', 'h2', 'details', 'p', 'li', 'blockquote'].map((x) => x.toUpperCase())
);

let preSpaceIfNotPunct = (s: string | null) =>
	!s || s.match(/^[\p{Pe}\p{Pf}\p{Po}]/u) ? s : ' ' + s;
function divSplit(v: ArrOr1<Node>) {
	let f = (prev: string[], n: Node) => {
		// @ts-expect-error
		if (splittags.has(n.tagName)) return [...prev, n.textContent || '', ''];
		else {
			const [y, ...x] = prev.toReversed(); // (x..., y) = prev but js doesnt allow
			return [...x.toReversed(), y + preSpaceIfNotPunct(n.textContent)];
		}
	};

	return pipe(
		Array.isArray(v) ? v : Array.from(v.childNodes),
		A.reduce<Node, string[]>([''], f),
		A.filter((s) => s.trim().length != 0),
		A.map(tok.sentences),
		A.flatten
	);
}

function succ(e: ArrOr1<Element>): O.Option<ArrOr1<Element>> {
	let siblings = (e: Element) => Array.from(e.parentElement?.children || []);
	let precedingSectionTags = (e: Element) =>
		pipe(
			siblings(e),
			A.takeLeftWhile((e2) => e2 != e),
			A.filter((e2) => sectiontags.has(e2.tagName))
		);
	let takeTillNextSectionTag = (e: Element) =>
		pipe(
			siblings(e),
			A.dropLeftWhile((e2) => e != e2),
			A.takeLeftWhile((e2: Element) => !(e2 != e && sectiontags.has(e2.tagName)))
		);

	if (Array.isArray(e)) return O.fromNullable(e[0].parentElement);
	if (sectiontags.has(e.tagName)) return O.fromNullable(e.parentElement);
	const sts = precedingSectionTags(e);
	if (A.isEmpty(sts)) return O.fromNullable(e.parentElement);
	return pipe(A.last(sts), O.map(takeTillNextSectionTag));
}
const generateUp = (e: O.Option<ArrOr1<Element>>): ArrOr1<Element>[] =>
	pipe(
		e,
		O.fold(
			() => [],
			(e) => [e, ...generateUp(succ(e))]
		)
	);
// let itOrFirst = <T>(e: T | T[]) => (Array.isArray(e) ? e[0] : e);
// let mapOrApply =
// 	<T, U>(f: (t: T) => U) =>
// 	(e: T | T[]) =>
// 		Array.isArray(e) ? e.map(f) : f(e);
// let listOrWrap = <T>(e: T | T[]) => (Array.isArray(e) ? e : [e]);
// let listOrChildren = (e: ArrOr1<Element>) => (Array.isArray(e) ? e : Array.from(e.children));
let listOrAllChildren = (e: ArrOr1<Node>) => (Array.isArray(e) ? e : Array.from(e.childNodes));

// let sentences = (html: string) => tok.sentences(html, { sanitize: true, html_boundaries: true });
function match(uuid: string) {
	let _match = (uuid: string) => (e: Element) =>
		new Set(e.classList).has('_' + uuid) ? [e] : Array.from(e.getElementsByClassName('_' + uuid));
	//@ts-expect-error
	return (n: Node) => ('classList' in n ? _match(uuid)(n) : []);
}
let hasMatch = (uuid: string) => (e: Node) => match(uuid)(e).length > 0;

let last = <T>(a: T[]) => a[a.length - 1];
let first = <T>(a: T[]) => a[0];
let getContent = (
	n: Node //@ts-expect-error
) => ('outerHTML' in n ? ((n: Element) => n.outerHTML)(n) : n.textContent || '');

function getFullSentences(es: ArrOr1<Node>, uuid: string, sp = 'n_______n') {
	let makeNonempty =
		<T>(placeholder: T) =>
		(xs: T[]) =>
			pipe(
				nEA.fromArray(xs),
				O.match(() => nEA.of(placeholder), identity)
			);

	const body = new JSDOM(listOrAllChildren(es).map(getContent).join('')).window.document.body;
	const bodyText = body.innerText || body.textContent
	if (bodyText === null) return ""

	const matching = A.filter(hasMatch(uuid))(Array.from(body.children));

	const match_ = match(uuid);
	const fm = match_(matching[0])[0];
	const _lm = match_(matching[matching.length - 1]);
	const lm = _lm[_lm.length - 1];
	const _t1 = fm.textContent;
	fm.textContent = sp + _t1;
	const _t2 = lm.textContent;
	lm.textContent = _t2 + sp;
	const sents = divSplit(Array.from(body.childNodes)).join(' ');
	// console.log(divSplit(Array.from(body.childNodes)));
	const [left, mid, right] = sents.split(sp);
	// console.log([left, mid, right]);
	let g = preSpaceIfNotPunct;
	const h = makeNonempty('');
	// instead can take: shortest prefix of the left below that only occurs once in body.innerText and split on that
	// and then likewise .........suffix .......right...
	function getShortestXfix(p: string, pre: boolean, n = 1) {
		const rev = pre ? (x: string[]) => x : (x: string[]) => x.toReversed()
		const prefix = rev(rev(p.split(' ')).slice(0, n)).join(' ');
		// @ts-ignore
		const nmatch = Array.from(bodyText.matchAll(RegExp(prefix, "g"))).length;
		switch (nmatch) {
			case 1:
				return O.some(prefix);
			case 0:
				return O.none
			default:  // more matches - too short
				return getShortestXfix(p, pre, n+1)
		}
	}
	const potResult = [last(h(tok.sentences(left))), g(mid), g(first(h(tok.sentences(right))))].join("")
	const pre_short = getShortestXfix(potResult, true)
	const post_short = getShortestXfix(potResult, false)
	if (O.isNone(pre_short) || O.isNone(post_short))
		return potResult  // this most likely means our sentence appears twice in the text..
	let text = bodyText
	text = pre_short.value + text.split(pre_short.value)[1]
	text = text.split(post_short.value)[0] + post_short.value
	return text
}
export function f(d: Document, uuid: string, selectedText: string) {
	const matches = Array.from(d.getElementsByClassName('_' + uuid));
	const root = goUp(
		(e) => e.getElementsByClassName('_' + uuid).length == matches.length,
		matches[0]
	);
	const gen = generateUp(O.fromNullable(root));
	const contextNodeOpt = A.findFirst<ArrOr1<Element>>((e) => divSplit(e).length > 2)(gen);
	if (O.isNone(contextNodeOpt)) throw error('QCH empty page?');
	const contextNode = contextNodeOpt.value;
	const potentialQuote = listOrAllChildren(contextNode);
	const context = divSplit(potentialQuote).join('. ');

	const is4highlight = (t: string) => t.split(' ').length < 6;
	if (!is4highlight(selectedText)) return { quote: selectedText, context, highlights: [] };
	const highlights = [selectedText];
	const quoteNodes = A.filter(hasMatch(uuid))(potentialQuote);
	let quote = getFullSentences(quoteNodes, uuid);

	const tooShort = (s: string) => s.split(' ').length < 6;
	if (tooShort(quote)) quote = getFullSentences(contextNode, uuid);

	return { quote, context, highlights };
	// _quote = try2getfullsentences(sel, quotenodes)
}
