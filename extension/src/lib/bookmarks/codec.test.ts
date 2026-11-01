import { describe, it, expect } from "vitest"
import { v5 } from "uuid"
import {
  ARCHIVE, STAR, decode, decodeTitle, deepestTag, encode, encodeTitle, folderPathToTag, noteId, serialiseTag,
  type EncodableNote, type TitleParts,
} from "./codec"

const parts = (p: Partial<TitleParts>): TitleParts => ({ title: "", quote: "", tags: [], prioritised: 0, ...p })
const roundTrip = (p: TitleParts) => expect(decodeTitle(encodeTitle(p))).toEqual(p)
const URL = "https://example.com/a#:~:text=hello"

describe("noteId", () => {
  it("is uuidv5 of the url in the Faro namespace, fragment included", () => {
    expect(noteId(URL)).toBe(v5(URL, "0646f4ce-17c9-4a66-963e-280982b6ac8a"))
    expect(noteId(URL)).not.toBe(noteId("https://example.com/a"))
    expect(noteId(URL)).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/)
  })
})

describe("decodeTitle (former bookmark2Note cases)", () => {
  it("title, quote and tags", () => {
    expect(decodeTitle("My Article Title \"This is a quote\" #tag1 #tag2"))
      .toEqual(parts({ title: "My Article Title", quote: "This is a quote", tags: ["tag1", "tag2"] }))
  })
  it("no quote", () => {
    expect(decodeTitle("Just a title #tag1")).toEqual(parts({ title: "Just a title", tags: ["tag1"] }))
  })
  it("quote without tags (old bug)", () => {
    expect(decodeTitle("Article Title \"Some quote\"")).toEqual(parts({ title: "Article Title", quote: "Some quote" }))
  })
  it("multiple quoted groups: last one is the quote", () => {
    expect(decodeTitle("Title \"First quote\" \"Second quote\" #tag"))
      .toEqual(parts({ title: "Title \"First quote\"", quote: "Second quote", tags: ["tag"] }))
  })
  it("no quote and no tags", () => {
    expect(decodeTitle("Just a title")).toEqual(parts({ title: "Just a title" }))
  })
  it("quote not directly before the tags is part of the title", () => {
    expect(decodeTitle("A \"b\" c #t")).toEqual(parts({ title: "A \"b\" c", tags: ["t"] }))
  })
})

describe("flags", () => {
  it("star", () => expect(decodeTitle("T \"q\" #a ⭐")).toEqual(parts({ title: "T", quote: "q", tags: ["a"], prioritised: 5 })))
  it("archive with U+FE0F", () => expect(decodeTitle("T #a \u{1F5C4}\uFE0F").prioritised).toBe(-5))
  it("archive without U+FE0F", () => expect(decodeTitle("T #a \u{1F5C4}").prioritised).toBe(-5))
  it("encodes archive with U+FE0F", () => {
    expect(encodeTitle(parts({ title: "T", prioritised: -5 }))).toBe("T \u{1F5C4}\uFE0F")
    expect(ARCHIVE).toBe("🗄️")
  })
  it("only a trailing flag counts", () => {
    expect(decodeTitle("⭐ Stars ⭐ of 2024 #x")).toEqual(parts({ title: "⭐ Stars ⭐ of 2024", tags: ["x"] }))
    expect(decodeTitle("T⭐")).toEqual(parts({ title: "T⭐" }))
  })
  it("plain title that ends with a flag gets escaped", () => {
    const p = parts({ title: "Best of ⭐" })
    expect(encodeTitle(p)).toBe("Best of \\⭐")
    roundTrip(p)
    roundTrip(parts({ title: "Best of 🗄️", prioritised: 5 }))
    roundTrip(parts({ title: "Best of 🗄", tags: ["a"] }))
  })
  it("non-standard prioritised values map to the sign", () => {
    expect(decodeTitle(encodeTitle(parts({ title: "T", prioritised: 3 }))).prioritised).toBe(5)
    expect(decodeTitle(encodeTitle(parts({ title: "T", prioritised: -1 }))).prioritised).toBe(-5)
  })
})

describe("quotes containing special characters", () => {
  const cases = [
    "she said \"hi\"",
    "\"",
    "a\\b",
    "ends with backslash\\",
    "C# is #1",
    "x #tag",
    "x #\"tag\"",
    "x #",
    "rated ⭐",
    "file it 🗄️",
    "file it 🗄",
    "⭐",
    "line1\nline2",
    "  spaced  ",
  ]
  for (const quote of cases) {
    it(JSON.stringify(quote), () => {
      roundTrip(parts({ title: "T", quote }))
      roundTrip(parts({ title: "T", quote, tags: ["a", "b c"] }))
      roundTrip(parts({ title: "T", quote, prioritised: 5 }))
      roundTrip(parts({ title: "T", quote, tags: ["x"], prioritised: -5 }))
    })
  }
  it("escapes only \" and \\ inside the quote", () => {
    expect(encodeTitle(parts({ title: "T", quote: "say \"hi\" \\ #x ⭐" }))).toBe("T \"say \\\"hi\\\" \\\\ #x ⭐\"")
  })
})

describe("tags", () => {
  it("bare when simple, quoted otherwise", () => {
    expect(serialiseTag("recipes")).toBe("#recipes")
    expect(serialiseTag("a/b/c")).toBe("#a/b/c")
    expect(serialiseTag("Recipes Italian/Pasta")).toBe("#\"Recipes Italian/Pasta\"")
    expect(serialiseTag("say \"x\"")).toBe("#\"say \\\"x\\\"\"")
    expect(serialiseTag("a\\b")).toBe("#\"a\\\\b\"")
    expect(serialiseTag("C#")).toBe("#\"C#\"")
    expect(serialiseTag("nb\u00A0sp")).toBe("#\"nb\u00A0sp\"")
    expect(serialiseTag("tab\there")).toBe("#\"tab\there\"")
    expect(serialiseTag("⭐")).toBe("#\"⭐\"")
    expect(serialiseTag("🗄")).toBe("#\"🗄\"")
    expect(serialiseTag("👩‍💻")).toBe("#👩‍💻")
    expect(serialiseTag("❤️")).toBe("#❤️")
    expect(serialiseTag("AC∕DC")).toBe("#AC∕DC")
  })
  const tags = ["Recipes Italian/Pasta", "a/b", "say \"x\"", "a\\b", "C#", "nb\u00A0sp", "⭐", "🗄️", "👩‍💻", "❤️", "#", "\"", " lead", "trail "]
  it("round-trip with and without quote", () => {
    roundTrip(parts({ title: "T", tags }))
    roundTrip(parts({ title: "T", quote: "q", tags, prioritised: 5 }))
    for (const t of tags) roundTrip(parts({ title: "T", quote: "q", tags: [t] }))
  })
  it("#\"…\" directly after a quote", () => {
    expect(encodeTitle(parts({ title: "T", quote: "q", tags: ["a b"] }))).toBe("T \"q\" #\"a b\"")
    expect(decodeTitle("T \"q\" #\"a b\" #\"c\\\"d\"")).toEqual(parts({ title: "T", quote: "q", tags: ["a b", "c\"d"] }))
  })
  it("empty tags are dropped", () => {
    expect(encodeTitle(parts({ title: "T", tags: ["", "a"] }))).toBe("T #a")
  })
})

describe("page titles", () => {
  it("stay verbatim when unambiguous", () => {
    expect(encodeTitle(parts({ title: "C# tips \"2024\"", quote: "q", tags: ["t"] }))).toBe("C# tips \"2024\" \"q\" #t")
    expect(encodeTitle(parts({ title: "C:\\dir", tags: ["t"] }))).toBe("C:\\dir #t")
    expect(encodeTitle(parts({ title: "👩‍💻 ❤️ dev", quote: "❤️ it", tags: ["👩‍💻"] }))).toBe("👩‍💻 ❤️ dev \"❤️ it\" #👩‍💻")
  })
  it("get escaped when they would be misread", () => {
    expect(encodeTitle(parts({ title: "Foo \"bar\"" }))).toBe("Foo \\\"bar\\\"")
    expect(encodeTitle(parts({ title: "Best #1" }))).toBe("Best \\#1")
    expect(encodeTitle(parts({ title: "Best #1", tags: ["a"] }))).toBe("Best \\#1 #a")
    expect(encodeTitle(parts({ title: "a\\#b" }))).toBe("a\\\\\\#b")
  })
  const titles = ["Foo \"bar\"", "Best #1", "#only", "\"", "\\", "a\\\"b", "x \\", "⭐", "🗄️", "", " ", "C# tips \"2024\"", "\"q\" #t ⭐", "x #\"y z\""]
  for (const title of titles) {
    it(`round-trips ${JSON.stringify(title)}`, () => {
      roundTrip(parts({ title }))
      roundTrip(parts({ title, quote: "q" }))
      roundTrip(parts({ title, tags: ["a", "b c"] }))
      roundTrip(parts({ title, quote: "q\"", tags: ["a"], prioritised: -5 }))
    })
  }
  it("hand-written titles decode best-effort", () => {
    expect(decodeTitle("C:\\dir \"q\"")).toEqual(parts({ title: "C:\\dir", quote: "q" }))
    expect(decodeTitle("T \"\" #a")).toEqual(parts({ title: "T \"\"", tags: ["a"] }))
    expect(decodeTitle("T #\"\" #a")).toEqual(parts({ title: "T", tags: ["a"] }))
  })
})

describe("folderPathToTag (§3.1)", () => {
  it("drops the browser root", () => {
    expect(folderPathToTag(["Bookmarks bar", "Recipes", "Italian"])).toBe("Recipes/Italian")
  })
  it("no tag directly in a root folder", () => {
    expect(folderPathToTag(["Other Bookmarks"])).toBeUndefined()
    expect(folderPathToTag([])).toBeUndefined()
  })
  it("keeps spaces inside a segment; trims and collapses tabs/NBSP", () => {
    expect(folderPathToTag(["Bookmarks bar", "Recipes Italian", "Pasta"])).toBe("Recipes Italian/Pasta")
    expect(folderPathToTag(["Bookmarks bar", "  My \t\u00A0 Stuff  ", "x"])).toBe("My Stuff/x")
  })
  it("does not strip U+200D / U+FE0F", () => {
    expect(folderPathToTag(["Bookmarks bar", " 👩‍💻 ", "❤️"])).toBe("👩‍💻/❤️")
  })
  it("/ inside a segment becomes U+2215", () => {
    expect(folderPathToTag(["Bookmarks bar", "My Stuff", "AC/DC"])).toBe("My Stuff/AC\u2215DC")
  })
  it("drops empty segments, keeps case", () => {
    expect(folderPathToTag(["Bookmarks bar", "", "  ", "Work", "work"])).toBe("Work/work")
  })
  it("quotes and backslashes survive via the quoted tag form", () => {
    const tag = folderPathToTag(["Bookmarks bar", "say \"hi\"", "a\\b"])!
    expect(tag).toBe("say \"hi\"/a\\b")
    expect(serialiseTag(tag)).toBe("#\"say \\\"hi\\\"/a\\\\b\"")
    roundTrip(parts({ title: "T", tags: [tag] }))
  })
  it("E2E example: My Stuff/AC∕DC folder round-trips", () => {
    const tag = folderPathToTag(["Bookmarks bar", "My Stuff", "AC/DC"])!
    const enc = encode({ url: URL, title: "Page", quote: "", tags: [tag], prioritised: 0 })
    expect(enc.title).toBe("Page #\"My Stuff/AC∕DC\"")
    expect(enc.folderPath).toEqual(["My Stuff", "AC∕DC"])
  })
})

describe("encode / decode", () => {
  const note: EncodableNote = { url: URL, title: "Page", quote: "hello", tags: ["x", "a/b/c", "a/b"], prioritised: 5 }
  it("encodes title, url and the deepest-tag folder", () => {
    expect(encode(note)).toEqual({ title: "Page \"hello\" #x #a/b/c #a/b ⭐", url: URL, folderPath: ["a", "b", "c"] })
  })
  it("folder: no tags → Faro root; ties → smallest; empty segments dropped", () => {
    expect(encode({ ...note, tags: [] }).folderPath).toEqual([])
    expect(deepestTag(["b/x", "a/y", "z"])).toBe("a/y")
    expect(encode({ ...note, tags: ["a//b/"] }).folderPath).toEqual(["a", "b"])
  })
  it("decodes under Faro", () => {
    const d = decode({ ...encode(note), dateAdded: 0 }, ["Other Bookmarks", "Faro", "a", "b", "c"], true)
    expect(d).toEqual({ ...note, id: noteId(URL), created_at: "1970-01-01T00:00:00.000Z", underFaro: true, derivedTags: [] })
  })
  it("outside Faro: title only, plus the folder as a derived tag", () => {
    const d = decode({ title: "C# tips \"2024\" #x ⭐", url: "https://c.sh" }, ["Bookmarks bar", "Dev", "C#"], false)
    expect(d).toEqual({
      id: noteId("https://c.sh"), url: "https://c.sh", title: "C# tips \"2024\" #x ⭐", quote: "", tags: [], prioritised: 0,
      underFaro: false, derivedTags: ["Dev/C#"],
    })
    expect(decode({ title: "t", url: "u" }, ["Bookmarks bar"], false).derivedTags).toEqual([])
  })
})

// ---------- property-style round trips ----------

const mulberry32 = (seed: number) => () => {
  seed = (seed + 0x6D2B79F5) | 0
  let t = seed
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}
const ALPHABET = [
  "a", "b", "Z", "1", " ", " ", "\"", "\\", "#", "/", "⭐", "🗄", "\uFE0F", "\u200D", "\u00A0", "\t", "\n",
  "👩‍💻", "❤️", "∕", ":", "~", "ł", "日",
]
const TOKENS = [" #", " \"", "\" ", " ⭐", " 🗄️", "\\\"", "#\"", "\\\\"]

describe("round-trip properties", () => {
  const rnd = mulberry32(42)
  const int = (n: number) => Math.floor(rnd() * n)
  const str = (max: number) => {
    let s = ""
    const n = int(max + 1)
    for (let i = 0; i < n; i++) s += rnd() < 0.15 ? TOKENS[int(TOKENS.length)] : ALPHABET[int(ALPHABET.length)]
    return s
  }
  const genNote = (): EncodableNote => ({
    url: "https://e.x/" + int(1000),
    title: str(12),
    quote: rnd() < 0.3 ? "" : str(12),
    tags: Array.from({ length: int(4) }, () => str(6)).filter(t => t !== ""),
    prioritised: [0, 5, -5][int(3)],
  })

  it("decode(encode(note)) == note for 5000 generated notes", () => {
    for (let i = 0; i < 5000; i++) {
      const n = genNote()
      const enc = encode(n)
      const { id, underFaro, derivedTags, created_at, ...back } = decode(enc, [], true)
      expect(back, JSON.stringify(enc.title)).toEqual(n)
      expect(id).toBe(noteId(n.url))
      expect(created_at).toBeUndefined()
      expect(underFaro).toBe(true)
      expect(derivedTags).toEqual([])
    }
  })

  it("encode(decode(title)) == title for every title we produce", () => {
    for (let i = 0; i < 2000; i++) {
      const { title } = encode(genNote())
      expect(encodeTitle(decodeTitle(title))).toBe(title)
    }
  })

  it("decoding arbitrary hand-written titles never throws and re-encodes stably", () => {
    for (let i = 0; i < 2000; i++) {
      const raw = str(30)
      const p = decodeTitle(raw)
      const enc = encodeTitle(p)
      expect(decodeTitle(enc)).toEqual(p)
    }
  })
})
