import { expect, test } from "vitest"
import {
  adjIdxs,
  convertIndicesToRangy,
  createTextFragment,
  extractPrePost,
  normalize,
  prepostfixes,
  stripQuote,
  subIdxs,
  textFragmentToIndices,
} from "./util"
import { JSDOM } from "jsdom"
import { readFile } from "fs/promises"
import { pipe } from "fp-ts/lib/function"

// Create a mock document that can be used in tests
const mockDocument = (html: string) => {
  const dom = new JSDOM(html)
  const originalDocument = global.document

  // Save the original document
  const restoreDocument = () => {
    if (originalDocument) {
      global.document = originalDocument
    } else {
      // Instead of deleting, set to undefined
      global.document = undefined as unknown as Document
    }
  }

  // Set the mocked document
  global.document = dom.window.document

  // Return the DOM, mock document, and cleanup function
  return {
    dom,
    document: dom.window.document,
    restore: restoreDocument,
  }
}

test("long", async () => {
  const s = "Which is 5 + 1, or 2+4."
  expect(prepostfixes(s)).toStrictEqual(["Which is", " or 2+4."])
})
test("short", async () => {
  const s = "hey!"
  expect(prepostfixes(s)).toStrictEqual(["hey!", "hey!"])
})

const load = async (s: string): Promise<HTMLElement> =>
  pipe(await readFile(__dirname + s, {}), x => new JSDOM(x.toString()).window.document.body)

test("adjIdxs html", async () => {
  const body = await load("/steg2.html")
  const quote = "skeletal mounts and plate"
  const pre_post = prepostfixes(quote)
  const [l, r] = adjIdxs(body.textContent || "", pre_post, 1200, 1200 + quote.length)
  // compared with rangy indices seem fine
  expect(normalize(body.textContent).substring(l, r)).toBe(quote)
})

const ser = "type:textContent|443$488$1$_bce066f4-f72c-407f-a89e-6ab478629cfb$"

test("subIdxs", async () => {
  expect(subIdxs(ser, 445, 489)).toBe("type:textContent|445$489$1$_bce066f4-f72c-407f-a89e-6ab478629cfb$")
})

test("extractQuote", async () => {
  expect(extractPrePost(ser + "henlo ev$eryone!")).toStrictEqual(["henlo ev", "eryone!"])
  expect(extractPrePost(ser + "henlo$yone!")).toStrictEqual(["henlo", "yone!"])
  expect(stripQuote(ser + "henlo ev$eryone!")).toBe(ser)
})

test("html text fragment test with mocked document", async () => {
  // Load the HTML content
  const html = await readFile(__dirname + "/steg2.html", {}).then(x => x.toString())
  const quote = "skeletal mounts and plate"

  // Set up mocked document
  const mock = mockDocument(html)

  try {
    // First verify the text actually exists in the document
    const bodyText = normalize(mock.document.body.textContent)
    const quoteIndex = bodyText.indexOf(quote)
    expect(quoteIndex).toBeGreaterThan(-1) // Make sure text is found

    // Test createTextFragment with mocked
    const x = createTextFragment(quote, 0)
    expect(x).toBe(":~:text=skeletal,nd%20plate")

    // Get indices from the text fragment and verify
    const [l, r] = textFragmentToIndices(x, mock.document.body)
    console.log(l, r, quoteIndex, quoteIndex + quote.length)
    expect(l).toBe(quoteIndex) // Start index should match where the text is found
    expect(r).toBe(quoteIndex + quote.length) // End index should be start + length

    // Convert to Rangy format and verify
    const rangySerialized = convertIndicesToRangy(l, r)
    expect(rangySerialized).toMatch(/^type:textContent\|(\d+)\$(\d+)/)

    // Final check - the extracted text should match our quote
    expect(normalize(mock.document.body.textContent).substring(l, r)).toBe(quote)
  } finally {
    // Restore the original document
    mock.restore()
  }
})

