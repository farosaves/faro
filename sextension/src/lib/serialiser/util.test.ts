import { expect, test } from "vitest"
import { adjIdxs, extractPrePost, normalize, prepostfixes, stripQuote, subIdxs } from "./util"
import { JSDOM } from "jsdom"
import { readFile } from "fs/promises"
import { pipe } from "fp-ts/lib/function"

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
