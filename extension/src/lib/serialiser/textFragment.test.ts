import { expect, test } from "vitest"
import {
  matchDirective,
  pageText,
  parseDirective,
  type PageText,
  rangeIndices,
  rangeToTextFragment,
  regexTextFragment,
} from "./textFragment"
import { JSDOM } from "jsdom"
import { readFile } from "fs/promises"

/** Range over the `nth` (0-based) occurrence of `text` inside a single text node of `doc.body`. */
const rangeOver = (doc: Document, text: string, nth = 0): Range => {
  const walker = doc.createTreeWalker(doc.body, 4 /* NodeFilter.SHOW_TEXT */)
  let seen = 0
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const data = (n as Text).data
    for (let i = data.indexOf(text); i >= 0; i = data.indexOf(text, i + 1)) {
      if (seen++ < nth) continue
      const r = doc.createRange()
      r.setStart(n, i)
      r.setEnd(n, i + text.length)
      return r
    }
  }
  throw new Error(`occurrence ${nth} of ${text} not found`)
}

/** The fragment for the range, and whether the (simulated) browser's first match of it is exactly the selection. */
const roundTrip = (doc: Document, r: Range, pt: PageText = pageText(doc.body)) => {
  const fragment = rangeToTextFragment(r, pt)
  const d = parseDirective(fragment)
  expect(d).toBeDefined()
  const m = matchDirective(pt, d!)
  const want = rangeIndices(pt, r)
  return {
    fragment,
    matched: m && pt.text.slice(...m),
    wanted: pt.text.slice(...want),
    hits: m?.[0] === want[0] && m?.[1] === want[1],
  }
}

const dom = (body: string) => new JSDOM(`<!doctype html><body>${body}</body>`).window.document

test("unique text → plain text= directive, no context", () => {
  const doc = dom("<p>The quick brown fox jumps over the lazy dog.</p>")
  const r = roundTrip(doc, rangeOver(doc, "brown fox"))
  expect(r.fragment).toBe(":~:text=brown%20fox")
  expect(r.hits).toBe(true)
})

test("text repeated fewer than 16 times no longer throws", () => {
  // the old rangyToTextFragment called createTextFragment(quote, 15), which threw unless the text occurred ≥ 16 times
  const doc = dom("<p>alpha beta</p><p>alpha gamma</p>")
  expect(() => rangeToTextFragment(rangeOver(doc, "alpha", 1))).not.toThrow()
})

test("repeated text gets context for the selected occurrence only when needed", () => {
  const doc = dom("<p>red apple and green apple and blue apple</p>")
  const want = [":~:text=apple", ":~:text=green-,apple", ":~:text=blue-,apple"]
  want.forEach((fragment, nth) => {
    const r = roundTrip(doc, rangeOver(doc, "apple", nth))
    expect(r.hits).toBe(true)
    expect(r.fragment).toBe(fragment)
  })
})

test("context does not cross block boundaries; a suffix is used when there is no prefix", () => {
  const doc = dom("<p>cat sat</p><p>cat ran</p>")
  const r = roundTrip(doc, rangeOver(doc, "cat", 1))
  expect(r.fragment).toBe(":~:text=cat,-ran")
  expect(r.hits).toBe(true)
})

test("a selection inside a word is widened to the whole word (matches must be word-bounded)", () => {
  const doc = dom("<p>a template, a plate, plates</p>")
  const r = roundTrip(doc, rangeOver(doc, "late", 1)) // inside "plate"
  expect(r.wanted).toBe("plate")
  expect(r.fragment).toBe(":~:text=plate")
  expect(r.hits).toBe(true)
})

test("matching is case-insensitive, so differently-cased text counts as a repeat", () => {
  const doc = dom("<p>Hello world. And then hello again.</p>")
  const r = roundTrip(doc, rangeOver(doc, "hello"))
  expect(r.fragment).toBe(":~:text=then-,hello")
  expect(r.hits).toBe(true)
})

test("whitespace is collapsed and '-' / ',' / '&' are percent-encoded", () => {
  const doc = dom("<p>well-known,\n   fact &amp; more</p>")
  const r = roundTrip(doc, rangeOver(doc, "well-known,\n   fact & more"))
  expect(r.fragment).toBe(":~:text=well%2Dknown%2C%20fact%20%26%20more")
  expect(r.hits).toBe(true)
})

test("a selection across paragraphs uses textStart,textEnd", () => {
  const doc = dom("<p>first paragraph starts here and goes on</p><p>second one ends right there</p>")
  const range = doc.createRange()
  const [p1, p2] = [...doc.querySelectorAll("p")]
  range.setStart(p1.firstChild!, "first paragraph starts here and ".length)
  range.setEnd(p2.firstChild!, "second one ends".length)
  const r = roundTrip(doc, range)
  expect(r.wanted).toBe("goes on second one ends")
  expect(r.fragment).toBe(":~:text=goes%20on,one%20ends")
  expect(r.hits).toBe(true)
})

test("script and style text is ignored", () => {
  const doc = dom("<script>var unique = 1</script><style>.unique{}</style><p>a unique word</p>")
  const r = roundTrip(doc, rangeOver(doc, "unique", 2))
  expect(r.fragment).toBe(":~:text=unique")
  expect(r.hits).toBe(true)
})

test("every occurrence of a word on a real page (steg2.html) gets a fragment that resolves to it", async () => {
  const html = await readFile(__dirname + "/steg2.html", {}).then(x => x.toString())
  const doc = new JSDOM(html).window.document
  const pt = pageText(doc.body) // computed once: getComputedStyle is slow in jsdom
  let checked = 0
  for (let nth = 0; ; nth++) {
    let range: Range
    try {
      range = rangeOver(doc, "plate", nth)
    } catch {
      break
    }
    if (range.startContainer.parentElement?.closest("script,style")) continue
    const [s, e] = rangeIndices(pt, range)
    // a passage that occurs twice on the page can't be told apart by context from inside its block: best effort
    const breaks = [...pt.breaks]
    const blockStart = Math.max(0, ...breaks.filter(b => b < s))
    const blockEnd = Math.min(pt.text.length, ...breaks.filter(b => b >= e))
    const around = pt.text.slice(Math.max(blockStart, s - 150), Math.min(blockEnd, e + 150))
    if (pt.text.indexOf(around) !== pt.text.lastIndexOf(around)) continue
    const r = roundTrip(doc, range, pt)
    expect(r.hits, `occurrence ${nth}: ${r.fragment}`).toBe(true)
    checked++
  }
  expect(checked).toBeGreaterThan(10)

  const r = roundTrip(doc, rangeOver(doc, "skeletal mounts and plate"), pt)
  expect(r.hits).toBe(true)
})

test("regexTextFragment", async () => {
  const fragment = ":~:text=skeletal,nd%20plate"
  const match = fragment.match(regexTextFragment)
  console.log(match?.groups)
  const { prefix, mainStart, mainEnd, suffix } = match?.groups || {}
  expect(prefix).toBe(undefined)
  expect(mainStart).toBe("skeletal")
  expect(mainEnd).toBe("nd%20plate")
  expect(suffix).toBe(undefined)

  const fragment2 = ":~:text=skeletal,-nd%20plate"
  const match2 = fragment2.match(regexTextFragment)
  console.log(match2?.groups)
  const { prefix: prefix2, mainStart: mainStart2, mainEnd: mainEnd2, suffix: suffix2 } = match2?.groups || {}
  expect(prefix2).toBe(undefined)
  expect(mainStart2).toBe("skeletal")
  expect(mainEnd2).toBe(undefined)
  expect(suffix2).toBe("nd%20plate")

  const fragment3 = ":~:text=both-,skeletal,nd%20plate,-elements"
  const match3 = fragment3.match(regexTextFragment)
  console.log(match3?.groups)
  const { prefix: prefix3, mainStart: mainStart3, mainEnd: mainEnd3, suffix: suffix3 } = match3?.groups || {}
  expect(prefix3).toBe("both")
  expect(mainStart3).toBe("skeletal")
  expect(mainEnd3).toBe("nd%20plate")
  expect(suffix3).toBe("elements")

  const fragment4 = ":~:text=skeletal"
  const match4 = fragment4.match(regexTextFragment)
  console.log(match4?.groups)
  const { prefix: prefix4, mainStart: mainStart4, mainEnd: mainEnd4, suffix: suffix4 } = match4?.groups || {}
  expect(prefix4).toBe(undefined)
  expect(mainStart4).toBe("skeletal")
  expect(mainEnd4).toBe(undefined)
  expect(suffix4).toBe(undefined)

  const fragment5 = ":~:text=ure%20and%20-,plate,-%20arrange"
  const match5 = fragment5.match(regexTextFragment)
  console.log(match5?.groups)
  const { prefix: prefix5, mainStart: mainStart5, mainEnd: mainEnd5, suffix: suffix5 } = match5?.groups || {}
  expect(prefix5).toBe("ure%20and%20")
  expect(mainStart5).toBe("plate")
  expect(mainEnd5).toBe(undefined)
  expect(suffix5).toBe("%20arrange")
})

