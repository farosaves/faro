// export let normalize = (s: string) => s.replaceAll(/[\p{P}\s]/gu, "");

import { desc } from "$lib/shared/utils";
import { serialize } from "@supabase/ssr";

// export let normalize = (s: string) => s.replaceAll(/[\s+\p{P}\s+]/gu, " ");
export let normalize = (s: string | null) => s || "";
// add this to rangy serialisation
export let reserialize = (r: Range) =>
  prepostfixes(normalize(r.toString()))
    .map((s) => s.replaceAll("$", "\\$"))
    .join("$");
export let prepostfixes = (s: string, nToTake = 8) => {
  const snorm = normalize(s);
  const l = snorm.length;
  return [snorm.substring(0, nToTake), snorm.substring(l - nToTake, l)];
};
export let subIdxs = (s: string, l: number, r: number) =>
  s
    .replace(/(?<=type:textContent\|)\d+(?=\$)/, l.toString())
    .replace(/(?<=type:textContent\|\d+\$)\d+(?=\$)/, r.toString());
export let start = (s: string) =>
  parseInt(s.match(/(?<=type:textContent\|)\d+(?=\$)/)?.[0].toString() || "0");
export let end = (s: string) =>
  parseInt(
    s.match(/(?<=type:textContent\|\d+\$)\d+(?=\$)/)?.[0].toString() || "0"
  );
export let extractPrePost = (s: string) =>
  (s.match(/(?<=-[0-9a-f]{12}\$)(.*)$/)?.[0].toString() || "").split("$");
export let stripQuote = (s: string) =>
  s.replace(/(?<=-[0-9a-f]{12}\$)(.*)$/, "");

export let prepare2deserialize = (textContent: string, s: string) => 
  extractPrePost(s).length == 2
    ? subIdxs(
        stripQuote(s),
        ...adjIdxs(textContent, extractPrePost(s), start(s), end(s))
      )
    : stripQuote(s);

export const adjIdxs = (
  textContent: string,
  pre_post: string[],
  start: number,
  end: number,
  nToTake = 8
): [number, number] => {
  const [pre, post] = pre_post;
  const len = end - start;
  const matches = (xfix: string) =>
    Array.from(textContent.matchAll(RegExp(xfix, "gu")));
  const ss = matches(pre);
  const es = matches(post);

  const targetDiff = len - post.length;
  // prettier-ignore
  const aligned = <T extends { index: number }>(left: T[], right: T[]): T[][] => {
    if (!left.length || !right.length) return [];
    const [lf, ...lr] = left;
    const [rf, ...rr] = right;
    const diff = rf.index - lf.index;
    if (diff / targetDiff > 1.1)
        // too far apart -> right too far -> only update left
        return aligned(lr, right);
    else if (diff / targetDiff < 0.9)
        // too close -> left too far -> only update right
        return aligned(left, rr);
    else return [[lf, rf], ...aligned(lr, rr)];
};

  const score = (l: RegExpExecArray, r: RegExpExecArray) =>
    (1 + Math.abs(r.index - l.index - targetDiff)) * l.index - start;
  const allAligned = aligned(ss, es).toSorted(desc(([l, r]) => -score(l, r)));
  if (allAligned.length) {
    const [l, r] = allAligned[0];
    return [l.index, r.index + post.length];
  } else if (nToTake==0) {
    return [0,0]
  } else {
    return adjIdxs(textContent, pre_post, start, end, nToTake - 1);
  }
};
