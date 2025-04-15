import { expect, test } from "vitest"
import {
  convertIndicesToRangy,
  createTextFragment,
  normalize,
  regexTextFragment,
  textFragmentToIndices,
} from "./util"
import { JSDOM } from "jsdom"
import { readFile } from "fs/promises"

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

// test("long", async () => {
//   const s = "Which is 5 + 1, or 2+4."
//   expect(prepostfixes(s)).toStrictEqual(["Which is", " or 2+4."])
// })
// test("short", async () => {
//   const s = "hey!"
//   expect(prepostfixes(s)).toStrictEqual(["hey!", "hey!"])
// })

// const load = async (s: string): Promise<HTMLElement> =>
//   pipe(await readFile(__dirname + s, {}), x => new JSDOM(x.toString()).window.document.body)

// test("adjIdxs html", async () => {
//   const body = await load("/steg2.html")
//   const quote = "skeletal mounts and plate"
//   const pre_post = prepostfixes(quote)
//   const [l, r] = adjIdxs(body.textContent || "", pre_post, 1200, 1200 + quote.length)
//   // compared with rangy indices seem fine
//   expect(normalize(body.textContent).substring(l, r)).toBe(quote)
// })

// const ser = "type:textContent|443$488$1$_bce066f4-f72c-407f-a89e-6ab478629cfb$"

// test("subIdxs", async () => {
//   expect(subIdxs(ser, 445, 489)).toBe("type:textContent|445$489$1$_bce066f4-f72c-407f-a89e-6ab478629cfb$")
// })

// test("extractQuote", async () => {
//   expect(extractPrePost(ser + "henlo ev$eryone!")).toStrictEqual(["henlo ev", "eryone!"])
//   expect(extractPrePost(ser + "henlo$yone!")).toStrictEqual(["henlo", "yone!"])
//   expect(stripQuote(ser + "henlo ev$eryone!")).toBe(ser)
// })

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

test("html text fragment test with mocked v2", async () => {
  // Load the HTML content
  const html = await readFile(__dirname + "/steg2.html", {}).then(x => x.toString())
  const quote = "plate" // number 9: posture and plate arrangement

  // Set up mocked document
  const mock = mockDocument(html)

  try {
    // First verify the text actually exists in the document
    const bodyText = normalize(mock.document.body.textContent)
    const quoteIndex = bodyText.indexOf("ure and plate arrange") + 8 // adjust for preix
    expect(quoteIndex).toBeGreaterThan(-1) // Make sure text is found

    // Test createTextFragment with mocked
    const x = createTextFragment(quote, 5) // it should be 9th based on browser rendering.....
    expect(x).toBe(":~:text=ure%20and%20-,plate,-%20arrange")

    // Get indices from the text fragment and verify
    const [l, r] = textFragmentToIndices(x, mock.document.body)
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

