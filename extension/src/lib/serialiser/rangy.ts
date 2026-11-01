// dormant: kept for dynamic-content anchoring
// Rangy highlight serialise/deserialise from v1. Not imported by the extension in v2.0
// (text fragments are the only anchor, see lib/serialiser/textFragment.ts); kept so we can
// come back to it for dynamic pages (Reddit etc.). Needs the rangy scripts in public/rangy/.
/* eslint-disable @stylistic/comma-dangle */
import { normalize, rangyToTextFragment } from "./textFragment"

const elemsOfClass = (cls: string) => document.querySelectorAll(`.${cls}`) as NodeListOf<HTMLElement>

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") // $& means the whole matched string

function desc<T>(first: (t: T) => number): (t1: T, t2: T) => number {
  return (t1, t2) => first(t2) - first(t1)
}

export const gotoText = (uuid: string, textFragment?: string, testBody?: HTMLElement) => {
  if (textFragment && document.getElementsByClassName("_" + uuid).length === 0) {
    const docForDeserialize = testBody ? testBody.ownerDocument : undefined
    deserialize({})([uuid, textFragment], testBody, docForDeserialize)
  }

  const elems = elemsOfClass("_" + uuid)

  if (!elems.length) return
  elems.item(0)!.scrollIntoView({ block: "center", behavior: "auto" })
  elems.forEach((elem) => {
    const sc = elem.style.backgroundColor
    elem.style.backgroundColor = "#fff200"
    setTimeout(() => {
      elem.style.backgroundColor = sc
    }, 1000)
  })
}

// add this to rangy serialisation
export const reserialize = (r: Range): string => rangyToTextFragment(r)

/**
 * Converts text indices to a Rangy serialization format
 * @param startIndex The start index
 * @param endIndex The end index
 */
export const convertIndicesToRangy = (startIndex: number, endIndex: number): string => {
  const classId = "_" + Math.random().toString(16).substring(2, 14)
  return `type:textContent|${startIndex}$${endIndex}$1$${classId}$`
}

// Keep these functions for backward compatibility
export const prepostfixes = (s: string, nToTake = 8) => {
  const snorm = normalize(s)
  const l = snorm.length
  return [snorm.substring(0, nToTake), snorm.substring(l - nToTake, l)]
}

export const subIdxs = (s: string, l: number, r: number) =>
  s
    .replace(/(?<=type:textContent\|)\d+(?=\$)/, l.toString())
    .replace(/(?<=type:textContent\|\d+\$)\d+(?=\$)/, r.toString())

export const start = (s: string) =>
  parseInt(s.match(/(?<=type:textContent\|)\d+(?=\$)/)?.[0].toString() || "0")

export const end = (s: string) =>
  parseInt(s.match(/(?<=type:textContent\|\d+\$)\d+(?=\$)/)?.[0].toString() || "0")

export const extractPrePost = (s: string) =>
  (s.match(/(?<=-[0-9a-f]{12}\$)(.|\n)*$/)?.[0].toString() || "").split("$")

export const stripQuote = (s: string) => s.replace(/(?<=-[0-9a-f]{12}\$)(.|\n)*$/, "")

export const prepare2deserialize = (textContent: string, s: string) =>
  extractPrePost(s).length == 2
    ? subIdxs(stripQuote(s), ...adjIdxs(textContent, extractPrePost(s), start(s), end(s)))
    : stripQuote(s)

export const deserialize = (applierOptions: unknown) =>
  ([uuid, serialized]: [string, string], testBody?: HTMLElement, testDoc?: Document) => {
    if (!serialized) return
    const doc = testDoc || document

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const _rangy = rangy as any

    if (doc.getElementsByClassName("_" + uuid).length) return

    const hl = _rangy.createHighlighter()
    const app = _rangy.createClassApplier("_" + uuid, applierOptions)
    hl.addClassApplier(app)

    let prepared: string
    if (serialized.startsWith(":~:text=")) {
      prepared = serialized // TODO: this is wrong
    } else {
      // Legacy deserialization
      prepared = prepare2deserialize(doc.body.textContent || "", serialized)
    }
    try {
      hl.deserialize(prepared)
    } catch { return }
  }

export const adjIdxs = (
  textContent: string,
  pre_post: string[],
  startIdx: number,
  endIdx: number,
  nToTake = 8,
): [number, number] => {
  const [pre, post] = pre_post
  const len = endIdx - startIdx
  const matches = (xfix: string) => Array.from(textContent.matchAll(RegExp(escapeRegExp(xfix), "gu")))
  const ss = matches(pre)
  const es = matches(post)

  const targetDiff = len - post.length
  // prettier-ignore
  const aligned = <T extends { index: number }>(left: T[], right: T[]): T[][] => {
    if (!left.length || !right.length) return []
    const [lf, ...lr] = left
    const [rf, ...rr] = right
    const diff = rf.index - lf.index
    if (diff / targetDiff > 1.1)
      // too far apart -> right too far -> only update left
      return aligned(lr, right)
    else if (diff / targetDiff < 0.9)
      // too close -> left too far -> only update right
      return aligned(left, rr)
    else return [[lf, rf], ...aligned(lr, rr)]
  }

  const score = (l: RegExpExecArray, r: RegExpExecArray) =>
    (1 + Math.abs(r.index - l.index - targetDiff)) * Math.abs(l.index - startIdx)
  const allAligned = aligned(ss, es).toSorted(desc(([l, r]) => -score(l, r)))
  if (allAligned.length) {
    // TODO: here I changed
    const [l, r] = allAligned[0]
    return [l.index, r.index + post.length]
  } else if (nToTake == 0) {
    return [0, 0]
  } else {
    return adjIdxs(textContent, pre_post, startIdx, endIdx, nToTake - 1)
  }
}

