/* eslint-disable @stylistic/comma-dangle */
// Text-fragment (`#:~:text=`) anchoring: the only note anchor in 1.0.
//
// `rangeToTextFragment(range)` builds a directive (https://wicg.github.io/scroll-to-text-fragment/) that the
// browser resolves to the selected occurrence:
// - The page text is read the way the browser searches it: visible text nodes, whitespace collapsed, block
//   elements and <br> act as breaks; matching is case-insensitive and must start/end on word boundaries.
// - The selection is widened to whole words (a match can't start or end inside a word).
// - Short selections inside one block become `text=<quote>`; longer ones, or ones spanning blocks,
//   `text=<first words>,<last words>`.
// - Only when that directive would first match some other place on the page are `prefix-,` / `,-suffix` context
//   words added (growing one word at a time) until the first match is the selection.

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") // $& means the whole matched string

// export let normalize = (s: string) => s.replaceAll(/[\s+\p{P}\s+]/gu, " ");
export const normalize = (s: string | null) => s || ""

export type TextFragment = `:~:text=${string}`

/** The page text as the browser searches it, with the position of every text node in it. */
export type PageText = {
  /** Visible text, whitespace runs (and block breaks) collapsed to one space. */
  text: string
  /** Indices in `text` of spaces that stand for a block boundary or <br> (a single-term match can't span them). */
  breaks: Set<number>
  /** For each text node: `map[i]` = index in `text` where the node's raw offset `i` lands. */
  nodes: { node: Text, map: number[] }[]
}

const SKIP = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE", "HEAD", "TITLE", "IFRAME", "OBJECT", "TEXTAREA", "SELECT"])
const isWs = (c: string) => /\s/.test(c)
const displayOf = (el: Element) => {
  const view = el.ownerDocument.defaultView
  return view?.getComputedStyle ? view.getComputedStyle(el).display : ""
}

export const pageText = (root: Node): PageText => {
  let text = ""
  const breaks = new Set<number>()
  const nodes: PageText["nodes"] = []
  let pendingSpace = false
  let pendingBreak = false
  const flush = () => {
    if (pendingSpace && text.length) {
      if (pendingBreak) breaks.add(text.length)
      text += " "
    }
    pendingSpace = pendingBreak = false
  }
  const brk = () => {
    pendingSpace = pendingBreak = true
  }
  const visit = (n: Node) => {
    if (n.nodeType === 3) { // text
      const data = (n as Text).data
      const map: number[] = []
      for (let i = 0; i < data.length; i++) {
        map.push(text.length)
        if (isWs(data[i])) pendingSpace = true
        else {
          flush()
          text += data[i]
        }
      }
      map.push(text.length)
      nodes.push({ node: n as Text, map })
      return
    }
    if (n.nodeType !== 1 && n.nodeType !== 9 && n.nodeType !== 11) return
    const el = n as Element
    if (n.nodeType === 1) {
      if (SKIP.has(el.tagName.toUpperCase())) return
      if (el.tagName.toUpperCase() === "BR") return brk()
      const display = displayOf(el)
      if (display === "none") return
      const block = display !== "" && !display.startsWith("inline") && display !== "contents"
      if (block) brk()
      n.childNodes.forEach(visit)
      if (block) brk()
      return
    }
    n.childNodes.forEach(visit)
  }
  visit(root)
  return { text, breaks, nodes }
}

/** Index in `pt.text` of a DOM boundary point (`edge` says which way to resolve points between text nodes). */
const indexOf = (pt: PageText, container: Node, offset: number, edge: "start" | "end") => {
  const own = pt.nodes.find(n => n.node === container)
  if (own) return own.map[Math.min(offset, own.map.length - 1)]
  const doc = container.ownerDocument ?? (container as Document)
  const point = doc.createRange()
  point.setStart(container, offset)
  if (edge === "start") {
    const after = pt.nodes.find(n => point.comparePoint(n.node, 0) >= 0)
    return after ? after.map[0] : pt.text.length
  }
  const before = pt.nodes.findLast(n => point.comparePoint(n.node, n.node.length) <= 0)
  return before ? before.map[before.map.length - 1] : 0
}

const isWordChar = (c: string | undefined) => c !== undefined && /[\p{L}\p{N}\p{M}_]/u.test(c)
const boundary = (t: string, i: number) => !(isWordChar(t[i - 1]) && isWordChar(t[i]))

/** The selection as [start, end) in `pt.text`, trimmed of spaces and widened to whole words. */
export const rangeIndices = (pt: PageText, r: Range): [number, number] => {
  const t = pt.text
  let s = indexOf(pt, r.startContainer, r.startOffset, "start")
  let e = indexOf(pt, r.endContainer, r.endOffset, "end")
  while (s < e && t[s] === " ") s++
  while (e > s && t[e - 1] === " ") e--
  while (s > 0 && !boundary(t, s)) s--
  while (e < t.length && !boundary(t, e)) e++
  return [s, e]
}

export type Directive = { prefix?: string, start: string, end?: string, suffix?: string }

const enc = (s: string) => encodeURIComponent(s).replaceAll("-", "%2D")
export const encodeDirective = (d: Directive): TextFragment =>
  `:~:text=${d.prefix ? enc(d.prefix) + "-," : ""}${enc(d.start)}${d.end ? "," + enc(d.end) : ""}${d.suffix ? ",-" + enc(d.suffix) : ""}`

export const parseDirective = (fragment: string): Directive | undefined => {
  const m = fragment.match(/:~:text=([^&]*)/)
  if (!m) return undefined
  const parts = m[1].split(",")
  const prefix = parts[0]?.endsWith("-") ? parts.shift()!.slice(0, -1) : undefined
  const suffix = parts.at(-1)?.startsWith("-") ? parts.pop()!.slice(1) : undefined
  if (!parts.length || parts.length > 2) return undefined
  const dec = (s: string | undefined) => s === undefined ? undefined : decodeURIComponent(s)
  return { prefix: dec(prefix), start: dec(parts[0])!, end: dec(parts[1]), suffix: dec(suffix) }
}

const breakCounts = new WeakMap<PageText, Uint32Array>()
/** Number of breaks before index `i`. */
const breakCount = (pt: PageText, i: number) => {
  let c = breakCounts.get(pt)
  if (!c) {
    c = new Uint32Array(pt.text.length + 1)
    for (let j = 0; j < pt.text.length; j++) c[j + 1] = c[j] + Number(pt.breaks.has(j))
    breakCounts.set(pt, c)
  }
  return c[Math.max(0, Math.min(i, pt.text.length))]
}

/**
 * Where the browser's first match of `d` in `pt` is, as [start, end) (simplified scroll-to-text-fragment
 * algorithm: case-insensitive, word-bounded, single terms don't cross block breaks).
 */
export const matchDirective = (pt: PageText, d: Directive): [number, number] | undefined => {
  const t = pt.text.toLowerCase().length === pt.text.length ? pt.text.toLowerCase() : pt.text
  const low = (s: string) => t === pt.text ? s : s.toLowerCase()
  const crossesBreak = (from: number, to: number) => breakCount(pt, to) - breakCount(pt, from) > 0
  /** `term` at exactly `i`, word-bounded, not across a break → its end, else -1. */
  const at = (term: string, i: number) => {
    const s = low(term)
    if (!t.startsWith(s, i) || !boundary(t, i) || !boundary(t, i + s.length) || crossesBreak(i, i + s.length)) return -1
    return i + s.length
  }
  const skipSpace = (i: number) => t[i] === " " ? i + 1 : i
  const occurrences = function* (term: string, from: number) {
    const s = low(term)
    for (let i = t.indexOf(s, from); i >= 0; i = t.indexOf(s, i + 1))
      if (at(term, i) >= 0) yield i
  }
  const suffixOk = (i: number) => !d.suffix || at(d.suffix, skipSpace(i)) >= 0
  for (const p of occurrences(d.prefix ?? d.start, 0)) {
    let s = p
    if (d.prefix) {
      s = skipSpace(p + low(d.prefix).length)
      if (at(d.start, s) < 0) continue
    }
    const startEnd = at(d.start, s)
    if (!d.end) {
      if (suffixOk(startEnd)) return [s, startEnd]
      continue
    }
    let anyEnd = false
    for (const q of occurrences(d.end, startEnd)) {
      anyEnd = true
      const e = q + low(d.end).length
      if (suffixOk(e)) return [s, e]
    }
    if (!anyEnd) return undefined
  }
  return undefined
}

/** Single-term (exact) directives are used up to this length when the selection is inside one block. */
const EXACT_MAX = 300
const EDGE_WORDS = 3
const MAX_CONTEXT_WORDS = 10

/** Directive for [s, e) in `pt` that resolves to that occurrence (best effort if the page has none that does). */
export const directiveFor = (pt: PageText, s: number, e: number): Directive => {
  const t = pt.text
  const hasBreak = (from: number, to: number) => breakCount(pt, to) - breakCount(pt, from) > 0
  const quote = t.slice(s, e)
  // word start positions in [s, e)
  const spaces = [...quote.matchAll(/ /g)].map(m => s + m.index!)
  let base: Directive
  if (!spaces.length || (quote.length <= EXACT_MAX && !hasBreak(s, e))) base = { start: quote }
  else {
    const k = Math.min(EDGE_WORDS, Math.ceil(spaces.length / 2))
    // first k words, stopping at a block break; last k words likewise
    let startEnd = spaces[k - 1]
    const firstBreak = spaces.find(i => pt.breaks.has(i))
    if (firstBreak !== undefined && firstBreak < startEnd) startEnd = firstBreak
    let endStart = spaces[spaces.length - k] + 1
    const lastBreak = spaces.findLast(i => pt.breaks.has(i))
    if (lastBreak !== undefined && lastBreak + 1 > endStart) endStart = lastBreak + 1
    base = { start: t.slice(s, startEnd), end: t.slice(endStart, e) }
  }
  const hits = (d: Directive) => {
    const m = matchDirective(pt, d)
    return m !== undefined && m[0] === s && m[1] === e
  }
  if (hits(base)) return base

  // context words before s / after e, within the same block
  const before = t.slice(0, s).trimEnd()
  const blockStart = Math.max(-1, ...[...pt.breaks].filter(b => b < s)) + 1
  const prefixWords = before.slice(blockStart).split(" ").filter(Boolean)
  const after = t.slice(e).trimStart()
  const afterOffset = t.length - after.length
  const nextBreak = Math.min(t.length, ...[...pt.breaks].filter(b => b >= e))
  const suffixWords = nextBreak < afterOffset ? [] : t.slice(afterOffset, nextBreak).split(" ").filter(Boolean)
  let best = base
  for (let n = 1; n <= MAX_CONTEXT_WORDS; n++) {
    const prefix = prefixWords.slice(-n).join(" ") || undefined
    const suffix = suffixWords.slice(0, n).join(" ") || undefined
    const candidates: Directive[] = [
      { ...base, prefix },
      { ...base, suffix },
      { ...base, prefix, suffix },
    ].filter(d => d.prefix || d.suffix)
    const found = candidates.find(hits)
    if (found) return Object.fromEntries(Object.entries(found).filter(([, v]) => v !== undefined)) as Directive
    if (candidates.length) best = candidates.at(-1)!
    if (n > prefixWords.length && n > suffixWords.length) break
  }
  return best
}

/** Text-fragment URL hash for the given selection range (the occurrence it actually covers). */
export const rangeToTextFragment = (r: Range,
  pt: PageText = pageText(r.startContainer.ownerDocument?.body ?? r.startContainer)): TextFragment => {
  const [s, e] = rangeIndices(pt, r)
  if (s >= e) return encodeDirective({ start: normalize(r.toString()).replace(/\s+/g, " ").trim() })
  return encodeDirective(directiveFor(pt, s, e))
}

export const regexTextFragment = new RegExp(
  ":~:text=" // The text fragment prefix
  + "(?:(?<prefix>[^-]*)-,)?" // optional prefix followed by -,
  + "(?<mainStart>[^-,]+)" // main text fragment
  + "(,(?!-)(?<mainEnd>[^-,]+))?" // optional second main textxe
  + "(?:,-(?<suffix>[^-]*))?", // optional suffix with ,- prefix
)

export const textFragmentToIndices = (fragment: string): [number, number] => {
  // Parse the text fragment using the regex
  const textMatch = fragment.match(regexTextFragment)
  if (!textMatch) return [0, 0]

  // Extract and decode components using destructuring and ternaries
  const { prefix, mainStart, mainEnd, suffix } = textMatch.groups || {}
  const decodedMainStart = decodeURIComponent(mainStart ?? "")
  const decodedMainEnd = decodeURIComponent(mainEnd ?? "")
  const decodedPrefix = decodeURIComponent(prefix ?? "")
  const decodedSuffix = decodeURIComponent(suffix ?? "")

  if (!decodedMainStart) return [0, 0]

  // Get the document text content
  const fullText = typeof document !== "undefined" && document.body
    ? normalize(document.body.textContent)
    : ""

  if (!fullText) throw new Error("No text content found")

  // Create pattern fragments with concise ternary operators
  const prefixPattern = decodedPrefix ? `${escapeRegExp(decodedPrefix)}` : ""
  const mainStartPattern = `(${escapeRegExp(decodedMainStart)}`
  const mainEndPattern = decodedMainEnd ? `[\\s\\S]*?${escapeRegExp(decodedMainEnd)}` : ""
  const suffixPattern = decodedSuffix ? `)${escapeRegExp(decodedSuffix)}` : ")"

  // Combine patterns
  const fullPattern = new RegExp(`${prefixPattern}${mainStartPattern}${mainEndPattern}${suffixPattern}`, "i")

  // Find the match
  const match = fullText.match(fullPattern)

  // If we found a match with our pattern
  if (match && match.index !== undefined && match[1]) {
    const startIndex = match.index + (decodedPrefix.length || 0)
    const matchedLength = match[1].length
    return [startIndex, startIndex + matchedLength]
  }

  // Fallback: try finding just the main start text
  const startIndex = fullText.indexOf(decodedMainStart)
  if (startIndex === -1) return [0, 0]

  // If no end text, return just the start
  if (!decodedMainEnd) return [startIndex, startIndex + decodedMainStart.length]

  // Try to find end text after start
  const textAfterStart = fullText.substring(startIndex + decodedMainStart.length)
  const endIndex = textAfterStart.indexOf(decodedMainEnd)

  // Return appropriate range based on whether we found the end text
  return endIndex !== -1
    ? [startIndex, startIndex + decodedMainStart.length + endIndex + decodedMainEnd.length]
    : [startIndex, startIndex + decodedMainStart.length]
}
