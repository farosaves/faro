import { htmlstr2body } from "$lib/test_utils";
import { array as A, option as O, nonEmptyArray as nEA } from "fp-ts";
import { identity, pipe } from "fp-ts/lib/function";
import * as tok from "sbd";

type ArrOr1<T> = T[] | T;
function goUp(cond: (n: Element) => boolean, e: Element): Element {
  return cond(e.parentElement!)
    ? e.parentElement!
    : goUp(cond, e.parentElement!);
}
const sectiontags = new Set(
  ["ul", "h1", "h3", "h2", "details", "tr"].map((x) => x.toUpperCase()),
);

const splittags = new Set(
  ["ul", "h1", "h3", "h2", "details", "p", "li", "blockquote"].map((x) =>
    x.toUpperCase(),
  ),
);

let preSpaceIfNotPunct = <T extends string | null>(s: T) =>
  !s || s.match(/^[\p{Pe}\p{Pf}\p{Po}]/u) ? s : " " + s;

function divSplit(v: ArrOr1<Node>) {
  let f = (prev: string[], n: Node) => {
    // @ts-expect-error
    if (splittags.has(n.tagName)) return [...prev, n.textContent || "", ""];
    else {
      const [y, ...x] = prev.toReversed(); // (x..., y) = prev but js doesnt allow
      return [...x.toReversed(), y + preSpaceIfNotPunct(n.textContent)];
    }
  };

  return pipe(
    Array.isArray(v) ? v : Array.from(v.childNodes),
    A.reduce<Node, string[]>([""], f),
    A.filter((s) => s.trim().length != 0),
    A.map(tok.sentences),
    A.flatten,
  );
}

function succ(e: ArrOr1<Element>): O.Option<ArrOr1<Element>> {
  let siblings = (e: Element) => Array.from(e.parentElement?.children || []);
  let precedingSectionTags = (e: Element) =>
    pipe(
      siblings(e),
      A.takeLeftWhile((e2) => e2 != e),
      A.filter((e2) => sectiontags.has(e2.tagName)),
    );
  let takeTillNextSectionTag = (e: Element) =>
    pipe(
      siblings(e),
      A.dropLeftWhile((e2) => e != e2),
      A.takeLeftWhile(
        (e2: Element) => !(e2 != e && sectiontags.has(e2.tagName)),
      ),
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
      (e) => [e, ...generateUp(succ(e))],
    ),
  );
let listOrAllChildren = (e: ArrOr1<Node>) =>
  Array.isArray(e) ? e : Array.from(e.childNodes);

function match(uuid: string) {
  let _match = (uuid: string) => (e: Element) =>
    new Set(e.classList).has("_" + uuid)
      ? [e]
      : Array.from(e.getElementsByClassName("_" + uuid));
  //@ts-expect-error
  return (n: Node) => ("classList" in n ? _match(uuid)(n) : []);
}
let hasMatch = (uuid: string) => (e: Node) => match(uuid)(e).length > 0;

let last = <T>(a: T[]) => a[a.length - 1];
let first = <T>(a: T[]) => a[0];
let getContent = (n: Node) =>
  "outerHTML" in n ? n.outerHTML : n.textContent || "";

function getFullSentences(es: ArrOr1<Node>, uuid: string, sp = "n_______n") {
  let makeNonempty =
    <T>(placeholder: T) =>
    (xs: T[]) =>
      pipe(
        nEA.fromArray(xs),
        O.match(() => nEA.of(placeholder), identity),
      );

  const body = htmlstr2body(listOrAllChildren(es).map(getContent).join(""));
  const bodyText = body.innerText || body.textContent || "";
  if (bodyText === null) return "";

  const matching = A.filter(hasMatch(uuid))(Array.from(body.children));

  const match_ = match(uuid);
  const fm = match_(matching[0])[0];
  const _lm = match_(matching[matching.length - 1]);
  const lm = _lm[_lm.length - 1];
  const _t1 = fm.textContent;
  fm.textContent = sp + _t1;
  const _t2 = lm.textContent;
  lm.textContent = _t2 + sp;
  const sents = divSplit(Array.from(body.childNodes)).join(" ");
  // .replaceAll(/\\n\s*\\n/g, ". ");
  // console.log(divSplit(Array.from(body.childNodes)));
  const [left, mid, right] = sents
    .split(sp)
    .map((s) => s.replace(/(\\[nt])+/, " "));
  // console.log([left, mid, right]);
  // instead can take: shortest prefix of the left below that only occurs once in body.innerText and split on that
  // and then likewise .........suffix .......right...
  function getShortestXfix(p: string, pre: boolean, n = 1) {
    const rev = pre ? (x: string[]) => x : (x: string[]) => x.toReversed();
    const prefix = rev(rev(p.split(" ")).slice(0, n)).join(" ");
    const escapeRegExp = (s: string) =>
      s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string

    // @ts-ignore
    const nmatch = Array.from(
      bodyText.matchAll(RegExp(escapeRegExp(prefix), "g")),
    ).length;
    switch (nmatch) {
      case 1:
        return O.some(prefix);
      case 0:
        return O.none;
      default: // more matches - too short
        return getShortestXfix(p, pre, n + 1);
    }
  }
  const h = makeNonempty("");
  let g = preSpaceIfNotPunct;
  const noEndDot = (s: string) => !/\.$/.test(s.trim());
  const potResult = [
    last(h(tok.sentences(left).filter(noEndDot))),
    g(mid),
    g(first(h(tok.sentences(right)))),
  ].join("");
  const pre_short = getShortestXfix(potResult, true);
  const post_short = getShortestXfix(potResult, false);
  if (O.isNone(pre_short) || O.isNone(post_short)) return potResult; // this most likely means our sentence appears twice in the text..
  let text = bodyText;
  text = pre_short.value + text.split(pre_short.value)[1];
  text = text.split(post_short.value)[0] + post_short.value;
  return text;
}
// const wrapOrPass = <T>(e: ArrOr1<T>) => (Array.isArray(e) ? e : [e]);
export function makeQCH(d: Document, uuid: string, selectedText: string) {
  const matches = Array.from(d.getElementsByClassName("_" + uuid));
  const root = goUp(
    (e) => e.getElementsByClassName("_" + uuid).length == matches.length,
    matches[0],
  );
  const gen = generateUp(O.fromNullable(root));
  const contextNodeOpt = A.findFirst<ArrOr1<Element>>(
    (e) => divSplit(e).length > 2,
  )(gen);
  if (O.isNone(contextNodeOpt)) throw Error;
  const contextNode = contextNodeOpt.value;
  // console.log(wrapOrPass(contextNode)[0].children[0])
  const potentialQuote = listOrAllChildren(contextNode);
  let context = divSplit(potentialQuote)
    .map((s) => s.trim())
    .map(preSpaceIfNotPunct)
    // .map((s) => s.replace(/\P{Pe}+$/u, (s) => s + "."))
    .map((s) => s.replace(/[^!\?\.;]+$/u, (s) => s + "."))
    .join("")
    .trim();

  const is4highlight = (t: string) => t.trim().split(" ").length < 6;

  if (!is4highlight(selectedText))
    return { quote: selectedText, context, highlights: [] };
  const highlights = [selectedText];

  // console.log(divSplit(potentialQuote))
  // console.log(potentialQuote.map(x => x.textContent))
  // console.log(potentialQuote.map(x=>x.textContent))
  const quoteNodes = A.filter(hasMatch(uuid))(potentialQuote);
  // console.log(d.body.outerHTML)
  // console.log(wrapOrPass(contextNode).map(x=>x.outerHTML))
  // console.log(quoteNodes.map(x => x.outerHTML))
  // console.log(divSplit(quoteNodes))
  // console.log(tag(quoteNodes[0]))

  let quote = getFullSentences(quoteNodes, uuid);
  quote = quote
    .replaceAll(/\[\d{1,2}\]/g, "")
    .replaceAll(/\n+/g, " ")
    .trim();

  const tooShort = (s: string) => s.trim().split(" ").length < 6;
  if (tooShort(quote)) quote = getFullSentences(contextNode, uuid);
  if (quote.length > 1000) quote = selectedText;
  // wikipedia src delete

  quote = quote
    .replaceAll(/\[\d{1,2}\]/g, "")
    .replaceAll(/\n+/g, " ")
    .trim();
  return { quote, context, highlights };
  // _quote = try2getfullsentences(sel, quotenodes)
}
