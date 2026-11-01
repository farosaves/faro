/**
 * Bookmark codec: pure conversion between Faro notes and browser bookmarks (no `chrome.*` API).
 *
 * Browser bookmarks are the master copy of notes (docs/v2.0-implementation-plan.md §1–§3.1).
 *
 * ## API
 * - `noteId(url)`             – note id = uuidv5(url); the URL includes any `#:~:text=` fragment.
 * - `encode(note)`            – `{ title, url, folderPath }` for a note stored under `Faro/`.
 *                               `folderPath` is relative to the `Faro` folder (`[]` = `Faro/` itself).
 * - `decode(bm, path, faro)`  – bookmark → `DecodedNote`. `path` is the bookmark's full folder path from the
 *                               top-level browser folder down (e.g. `["Bookmarks bar", "Recipes"]`).
 *                               Outside `Faro/` the title is taken verbatim (no quote / tag / flag parsing) and
 *                               the folder path becomes a read-only `derivedTags` entry (decision 5.1c).
 * - `encodeTitle` / `decodeTitle` – the title grammar alone.
 * - `folderPathToTag(path)`   – §3.1 folder path → hierarchical tag (browser root dropped).
 * - `tagToFolderPath(tag)` / `deepestTag(tags)` – the folder a note is forced into.
 *
 * ## Title grammar (under `Faro/`)
 * ```
 * title   := [pageTitle] [" " quote] {" " tag} [" " flag]      (parts joined by a single space;
 *                                                               a leading space is omitted when pageTitle is empty)
 * quote   := '"' { escaped char } '"'                            only `"` → `\"` and `\` → `\\` are escaped
 * tag     := "#" bare | '#"' { escaped char } '"'
 * bare    := 1+ chars, none of: whitespace (incl. NBSP), `"`, `#`, `\`, `⭐`, `🗄`
 *            (tags with any of those are written in the quoted form, escaping `"` and `\`)
 * flag    := "⭐" (prioritised 5) | "🗄️" (U+1F5C4 U+FE0F, prioritised −5; decoder also accepts it without U+FE0F)
 * ```
 * Decoding works from the right: strip a trailing flag, then trailing tag tokens, then the last `"…"` group if it
 * ends right before them (its body may not contain an unescaped `"`). What is left is the page title.
 * Every token must be preceded by a space (or start the title).
 *
 * ### Page-title escaping
 * The page title is written verbatim whenever that decodes back to the same note (the common case, e.g.
 * `C# tips "2024" "quote" #t` is fine). Otherwise it is fully escaped: each of `\ " # ⭐ 🗄` gets a `\` in front,
 * which makes it impossible for the title to be mistaken for a quote, tag or flag. When decoding, the title is
 * always unescaped, but only `\` followed by one of those five characters is an escape – any other backslash
 * (e.g. `C:\dir`) is literal. A verbatim title containing such a sequence fails the round-trip check and gets
 * escaped, so `encode∘decode` stays lossless for everything `encode` produces.
 *
 * ### Other rules
 * - Empty quote ⇔ no quote group; empty tags are dropped; prioritised > 0 → ⭐, < 0 → 🗄️ (so only 5 / 0 / −5
 *   round-trip exactly).
 * - Folder = deepest tag (most `/` segments; ties → lexicographically smallest), split on `/`, empty segments
 *   dropped. No tags → `Faro/` itself.
 * - Hand-written titles are decoded best-effort: e.g. `\n` inside a quote stays as is, unknown flags are text.
 * - Strings are kept as is (newlines, U+200D, U+FE0F, …); only `folderPathToTag` normalises whitespace.
 */
import { v5 } from "uuid"

/** Same namespace as `uuidv5` in shared/src/lib/utils.ts (copied to keep this module dependency-free). */
const NAMESPACE = "0646f4ce-17c9-4a66-963e-280982b6ac8a"

export const STAR = "\u2B50" // ⭐
export const ARCHIVE = "\u{1F5C4}\uFE0F" // 🗄️
const ARCHIVE_BASE = "\u{1F5C4}"
export const STARRED = 5
export const ARCHIVED = -5

/** Fields a note must have to be written to a bookmark. */
export type EncodableNote = {
  url: string
  title: string
  quote: string
  tags: string[]
  prioritised: number
}

export type EncodedBookmark = {
  title: string
  url: string
  /** Folder segments below `Faro/`. */
  folderPath: string[]
}

export type DecodedNote = EncodableNote & {
  id: string
  /** ISO string from `bookmark.dateAdded`, when given. */
  created_at?: string
  /** True when the bookmark lives under `Faro/`, i.e. the title was parsed. */
  underFaro: boolean
  /** Read-only tags derived from the folder path of a bookmark outside `Faro/` (decision 5.1c). Never encoded. */
  derivedTags: string[]
}

export type BookmarkLike = { title: string, url: string, dateAdded?: number }

export const noteId = (url: string): string => v5(url, NAMESPACE)

// ---------- escaping ----------

const escapeQuoted = (s: string) => s.replace(/[\\"]/gu, c => "\\" + c)
const unescapeQuoted = (s: string) => s.replace(/\\([\\"])/gu, "$1")

const TITLE_SPECIAL = /[\\"#\u2B50\u{1F5C4}]/gu
const escapeTitle = (s: string) => s.replace(TITLE_SPECIAL, c => "\\" + c)
const unescapeTitle = (s: string) => s.replace(/\\([\\"#\u2B50\u{1F5C4}])/gu, "$1")

// ---------- tags ----------

const BARE_TAG = /^[^\s"#\\\u2B50\u{1F5C4}]+$/u

export const serialiseTag = (tag: string): string =>
  BARE_TAG.test(tag) ? "#" + tag : "#\"" + escapeQuoted(tag) + "\""

// ---------- title ----------

export type TitleParts = { title: string, quote: string, tags: string[], prioritised: number }

/** Tries the verbatim page title first, falls back to the escaped one if the verbatim one wouldn't round-trip. */
export const encodeTitle = (p: TitleParts): string => {
  const suffix = [
    ...(p.quote ? ["\"" + escapeQuoted(p.quote) + "\""] : []),
    ...p.tags.filter(t => t !== "").map(serialiseTag),
    ...(p.prioritised > 0 ? [STAR] : p.prioritised < 0 ? [ARCHIVE] : []),
  ]
  const build = (title: string) => [...(title ? [title] : []), ...suffix].join(" ")
  const plain = build(p.title)
  const back = decodeTitle(plain)
  const tags = p.tags.filter(t => t !== "")
  const prio = p.prioritised > 0 ? STARRED : p.prioritised < 0 ? ARCHIVED : 0
  const same = back.title === p.title && back.quote === p.quote && back.prioritised === prio
    && back.tags.length === tags.length && back.tags.every((t, i) => t === tags[i])
  return same ? plain : build(escapeTitle(p.title))
}

// All anchored at the end; `(?:^| )` makes every token start at a space or at the beginning.
const FLAG_RE = /(?:^| )(\u2B50|\u{1F5C4}\uFE0F?)$/u
const BARE_TAG_RE = /(?:^| )#([^\s"#\\\u2B50\u{1F5C4}]+)$/u
const QUOTED_TAG_RE = /(?:^| )#"((?:[^"\\]|\\.)*)"$/su
const QUOTE_RE = /(?:^| )"((?:[^"\\]|\\.)*)"$/su

/** Parses a title of a bookmark under `Faro/` (see the grammar in the module comment). */
export const decodeTitle = (raw: string): TitleParts => {
  let rest = raw
  let prioritised = 0
  const flag = FLAG_RE.exec(rest)
  if (flag) {
    prioritised = flag[1] === STAR ? STARRED : ARCHIVED
    rest = rest.slice(0, flag.index)
  }
  const tags: string[] = []
  for (;;) {
    const quoted = QUOTED_TAG_RE.exec(rest)
    const m = quoted ?? BARE_TAG_RE.exec(rest)
    if (!m) break
    const tag = quoted ? unescapeQuoted(m[1]) : m[1]
    if (tag !== "") tags.unshift(tag) // a hand-written `#""` is dropped
    rest = rest.slice(0, m.index)
  }
  let quote = ""
  const q = QUOTE_RE.exec(rest)
  if (q && q[1] !== "") {
    quote = unescapeQuoted(q[1])
    rest = rest.slice(0, q.index)
  }
  return { title: unescapeTitle(rest), quote, tags, prioritised }
}

// ---------- folders ----------

/** Deepest tag (most `/` segments); ties go to the lexicographically smallest one. */
export const deepestTag = (tags: string[]): string | undefined =>
  tags
    .filter(t => tagToFolderPath(t).length > 0)
    .reduce<string | undefined>((best, t) => {
      if (best === undefined) return t
      const d = tagToFolderPath(t).length - tagToFolderPath(best).length
      return d > 0 || (d === 0 && t < best) ? t : best
    }, undefined)

export const tagToFolderPath = (tag: string): string[] => tag.split("/").filter(s => s !== "")

// \s with the u flag covers tabs, NBSP and the other Unicode spaces, but not U+200D / U+FE0F.
const normaliseSegment = (s: string) => s.replace(/\s+/gu, " ").trim().replace(/\//gu, "\u2215")

/**
 * §3.1: a folder path (from the top-level browser folder down) → one hierarchical tag. The browser root
 * (`Bookmarks bar`, `Other Bookmarks`, …) is dropped, each segment is trimmed with whitespace runs collapsed to one
 * space, `/` inside a segment becomes `∕` (U+2215), empty segments are dropped, case is kept.
 * Returns `undefined` when nothing is left (bookmark directly in a root folder).
 */
export const folderPathToTag = (segments: string[]): string | undefined => {
  const parts = segments.slice(1).map(normaliseSegment).filter(s => s !== "")
  return parts.length ? parts.join("/") : undefined
}

// ---------- notes ----------

export const encode = (note: EncodableNote): EncodedBookmark => {
  const deepest = deepestTag(note.tags)
  return {
    title: encodeTitle(note),
    url: note.url,
    folderPath: deepest === undefined ? [] : tagToFolderPath(deepest),
  }
}

export const decode = (bookmark: BookmarkLike, folderPath: string[], underFaro: boolean): DecodedNote => {
  const base = {
    id: noteId(bookmark.url),
    url: bookmark.url,
    underFaro,
    ...(bookmark.dateAdded !== undefined ? { created_at: new Date(bookmark.dateAdded).toISOString() } : {}),
  }
  if (underFaro) return { ...base, ...decodeTitle(bookmark.title), derivedTags: [] }
  const derived = folderPathToTag(folderPath)
  return {
    ...base,
    title: bookmark.title,
    quote: "",
    tags: [],
    prioritised: 0,
    derivedTags: derived === undefined ? [] : [derived],
  }
}
