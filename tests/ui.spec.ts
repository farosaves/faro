// WS-D: the save flow (content script → text fragment → NoteSync.newNote) and the dashboard / side panel UI for
// plain and Faro notes. Bookmarks are seeded and asserted through chrome.bookmarks in the service worker; the UI is
// driven like a user would (dashboard.html / index.html opened as tabs).
import type { BrowserContext, Page, Worker } from "@playwright/test"
import fs from "fs"
import path from "path"
import { expect, test } from "./fixtures"

const BAR = "1" // Bookmarks bar
const ORIGIN = "http://faro-e2e.test"
const PAGE = ORIGIN + "/lighthouse.html"
const PAGE_TITLE = "Lighthouse notes"
const QUOTE = "the lamp was lit at dusk"
const SHOTS = process.env.FARO_SHOTS_DIR

// The quote occurs twice: once at the top, and once (the one we select) far below a tall spacer, so a fragment
// that resolved to the first occurrence would leave the page scrolled to the top.
const html = `<!doctype html><html><head><title>${PAGE_TITLE}</title></head><body>
<h1>Lighthouse notes</h1>
<p id="first">Every evening ${QUOTE} by the keeper.</p>
<div style="height: 4000px">spacer</div>
<p id="target">In the winter of 1890 ${QUOTE} and kept burning until dawn.</p>
<div style="height: 2000px"></div>
</body></html>`

/** Serves the test page (content scripts run on it like on any http page). */
const servePage = (context: BrowserContext) =>
  context.route(ORIGIN + "/**", route => route.fulfill({ status: 200, contentType: "text/html", body: html }))

const openDashboard = async (context: BrowserContext, extensionId: string) => {
  const page = await context.newPage()
  await page.setViewportSize({ width: 1400, height: 900 })
  await page.goto(`chrome-extension://${extensionId}/dashboard.html`)
  return page
}

const noteCard = (page: Page, id: string) => page.locator(`[data-testid="note"][data-note-id="${id}"]`)

const shot = async (page: Page, name: string) => {
  if (!SHOTS) return
  fs.mkdirSync(SHOTS, { recursive: true })
  await page.screenshot({ path: path.join(SHOTS, name), fullPage: false })
}

/** Selects the `nth` occurrence of `text` inside element `#id`. */
const select = (page: Page, id: string, text: string) => page.evaluate(({ id, text }) => {
  const node = document.getElementById(id)!.firstChild as Text
  const i = node.data.indexOf(text)
  const r = document.createRange()
  r.setStart(node, i)
  r.setEnd(node, i + text.length)
  const sel = window.getSelection()!
  sel.removeAllRanges()
  sel.addRange(r)
  return sel.toString()
}, { id, text })

/** Clicks the "save" context-menu entry on the tab showing `url`, the way a user would save a selection. */
const contextMenuSave = (sw: Worker, url: string) => sw.evaluate(async (url) => {
  const [tab] = await chrome.tabs.query({ url })
  await __faro.contextMenuSave(tab.id!)
}, url)

const seedPlain = (sw: Worker) => sw.evaluate(async ({ BAR }) => {
  const dir = await h.folder(BAR, ["Recipes", "Italian"])
  return h.bookmark(dir, "Pasta page", "https://example.com/pasta")
}, { BAR })

const seedFaro = (sw: Worker) => sw.evaluate(async ({ OTHER }) => {
  const dir = await h.folder(OTHER, ["Faro", "reading"])
  return h.bookmark(dir, "Essay \"the unexamined life\" #reading", "https://example.com/essay#:~:text=the%20unexamined%20life")
}, { OTHER: "2" })

test("saving a selection stores a Faro bookmark whose text fragment jumps to that occurrence", async ({ context, sw, extensionId }) => {
  await servePage(context)
  const page = await context.newPage()
  await page.goto(PAGE)
  expect(await select(page, "target", QUOTE)).toBe(QUOTE)

  // the content script may still be starting: retry the click until the bookmark exists
  const saved = async () => (await sw.evaluate(p => h.urlsStartingWith(p), PAGE)).filter(u => u.includes("#:~:text="))
  await expect.poll(async () => {
    if (!(await saved()).length) await contextMenuSave(sw, PAGE).catch(() => {})
    return (await saved()).length
  }, { timeout: 15_000, intervals: [500] }).toBe(1)

  const [url] = await saved()
  // the text is repeated on the page, so the fragment carries context for the selected (second) occurrence
  expect(url).toBe(PAGE + "#:~:text=1890-,the%20lamp%20was%20lit%20at%20dusk")
  const [bm] = await sw.evaluate(u => h.byUrl(u), url)
  expect(bm.title).toBe(`${PAGE_TITLE} "${QUOTE}"`)
  expect((await sw.evaluate(id => h.pathOf(id), bm.id)).slice(1)).toEqual(["Faro"])
  await expect.poll(() => sw.evaluate(u => h.note(u), url)).toMatchObject({ quote: QUOTE, underFaro: true })

  // opening the saved URL scrolls to the selected occurrence (not the first one)
  const jump = await context.newPage()
  await jump.goto(url)
  await expect.poll(() => jump.evaluate(() => {
    const r = document.getElementById("target")!.getBoundingClientRect()
    return { scrolled: window.scrollY > 3000, visible: r.top >= 0 && r.bottom <= window.innerHeight }
  }), { timeout: 10_000 }).toEqual({ scrolled: true, visible: true })

  // the dashboard shows the quote, and clicking the note opens its fragment URL
  const dash = await openDashboard(context, extensionId)
  const id = (await sw.evaluate(u => h.note(u), url))!.id
  await expect(noteCard(dash, id).getByTestId("note-quote")).toHaveText(QUOTE)
  const [opened] = await Promise.all([context.waitForEvent("page"), noteCard(dash, id).getByTestId("note-quote").click()])
  await expect.poll(() => opened.url()).toBe(url)
})

test("a plain bookmark shows without a quote and with its folder as a read-only tag; adding a tag adopts it", async ({ context, sw, extensionId }) => {
  const bm = await seedPlain(sw)
  await expect.poll(() => sw.evaluate(() => h.note("https://example.com/pasta")))
    .toMatchObject({ underFaro: false, quote: "", derivedTags: ["Recipes/Italian"] })
  const id = (await sw.evaluate(() => h.note("https://example.com/pasta")))!.id

  const dash = await openDashboard(context, extensionId)
  const card = noteCard(dash, id)
  await expect(card).toHaveAttribute("data-plain", "true")
  await expect(card.getByTestId("note-quote")).toHaveCount(0) // no quote text (decision 5.2)
  await expect(card.getByTestId("note-page")).toHaveText("example.com")
  // the page title heads its group and links to the page
  await expect(dash.getByTestId("group-title")).toHaveText("Pasta page")
  await expect(dash.getByTestId("group-title")).toHaveAttribute("href", "https://example.com/pasta")
  const folderTag = card.locator("[data-derived-tag]")
  await expect(folderTag).toHaveText("Recipes/Italian")
  await expect(card.locator("[data-tag]")).toHaveCount(0)

  // the folder tag can be filtered on: it is listed in the tag sidebar and in the search haystack
  await expect(dash.locator("aside").getByRole("button", { name: "Recipes" })).toBeVisible()
  expect((await sw.evaluate(({ id }) => h.get(id), { id: bm.id }))).toMatchObject({ title: "Pasta page", parentId: bm.parentId })

  // add a tag in the UI → the bookmark is adopted: folder tag + new tag in the title, moved under Faro/
  await card.getByTestId("note-tags").click()
  const input = card.locator(".tagify__input")
  await input.click()
  await input.pressSequentially("dinner", { delay: 50 })
  // Tagify handles Enter only once it has processed the typed text: retry until the tag is created
  await expect(async () => {
    if (await input.textContent()) await input.press("Enter")
    await expect(card.locator("tag")).toHaveCount(1, { timeout: 500 })
  }).toPass({ timeout: 5_000 })
  await expect.poll(() => sw.evaluate(({ id }) => h.get(id), { id: bm.id }), { timeout: 10_000 })
    .toMatchObject({ title: "Pasta page #Recipes/Italian #dinner" })
  expect((await sw.evaluate(({ id }) => h.pathOf(id), { id: bm.id })).slice(1)).toEqual(["Faro", "Recipes", "Italian"])
  await expect(card).toHaveAttribute("data-plain", "false")
  await expect(card.locator("[data-derived-tag]")).toHaveCount(0)
  await card.hover({ position: { x: 5, y: 5 } }) // close the editor by moving away
  await dash.mouse.click(5, 880)
  await expect(card.locator("[data-tag]")).toHaveText(["Recipes/Italian", "dinner"])
})

test("star and archive from the UI update the bookmark title (Faro and plain notes)", async ({ context, sw, extensionId }) => {
  const faro = await seedFaro(sw)
  const plain = await seedPlain(sw)
  await expect.poll(() => sw.evaluate(() => h.notes().length)).toBe(2)
  const idOf = (url: string) => sw.evaluate(u => h.note(u)!.id, url)
  const faroId = await idOf(faro.url!)
  const plainId = await idOf(plain.url!)

  const dash = await openDashboard(context, extensionId)
  const titleOf = (id: string) => sw.evaluate(async id => (await h.get(id))?.title, id)
  const click = async (noteId: string, what: "Note Star" | "Note Arch") => {
    const card = noteCard(dash, noteId)
    // star/archive sit in the note's options, opened with a right click on the note
    await card.locator(".collapse-title").click({ button: "right" })
    await card.locator(`label:has(input[data-umami-event="${what}"])`).click()
  }

  await click(faroId, "Note Star")
  await expect.poll(() => titleOf(faro.id)).toBe("Essay \"the unexamined life\" #reading ⭐")
  await click(faroId, "Note Arch")
  await expect.poll(() => titleOf(faro.id)).toBe("Essay \"the unexamined life\" #reading 🗄️")
  await click(faroId, "Note Arch") // toggle off
  await expect.poll(() => titleOf(faro.id)).toBe("Essay \"the unexamined life\" #reading")

  // starring a plain bookmark adopts it (folder → tag, moved under Faro/)
  await click(plainId, "Note Star")
  await expect.poll(() => titleOf(plain.id)).toBe("Pasta page #Recipes/Italian ⭐")
  expect((await sw.evaluate(id => h.pathOf(id), plain.id)).slice(1)).toEqual(["Faro", "Recipes", "Italian"])
})

test("side panel lists the current page's plain and Faro notes", async ({ context, sw, extensionId }) => {
  await servePage(context)
  // a plain bookmark of the page (title = page title, so it belongs to the page's group) and a saved highlight
  await sw.evaluate(async ({ BAR, PAGE, PAGE_TITLE }) => {
    await h.bookmark(await h.folder(BAR, ["Sea"]), PAGE_TITLE, PAGE)
  }, { BAR, PAGE, PAGE_TITLE })
  await sw.evaluate(({ PAGE, PAGE_TITLE }) => __faro.sync.newNote({
    quote: "kept burning until dawn", url: PAGE + "#:~:text=kept%20burning%20until%20dawn", title: PAGE_TITLE, tags: ["sea"],
  }), { PAGE, PAGE_TITLE })
  await sw.evaluate(() => h.idle())
  // the highlight adopted the plain bookmark (decision 5.1); add a second, still-plain bookmark of the page
  await sw.evaluate(async ({ BAR, PAGE, PAGE_TITLE }) => {
    await h.bookmark(await h.folder(BAR, ["Reading list"]), PAGE_TITLE, PAGE + "?print=1")
  }, { BAR, PAGE, PAGE_TITLE })
  // and notes of other pages, which only the dashboard shows
  await seedPlain(sw)
  await seedFaro(sw)
  await expect.poll(() => sw.evaluate(() => h.notes().length)).toBe(4)

  // the side panel shows the notes of the active tab's page in its window
  const page = await context.newPage()
  await page.goto(PAGE)
  const panel = await context.newPage()
  await panel.setViewportSize({ width: 360, height: 700 })
  await panel.goto(`chrome-extension://${extensionId}/index.html`)
  await panel.waitForTimeout(500)
  await sw.evaluate(async ({ PAGE_TITLE }) => {
    const win = await chrome.windows.getLastFocused()
      __faro.mut.currSrcs.update(m => new Map(m).set(win.id!, { domain: "faro-e2e.test", title: PAGE_TITLE }))
  }, { PAGE_TITLE })
  await expect(panel.getByTestId("note")).toHaveCount(2)
  await expect(panel.getByTestId("note-quote")).toHaveText("kept burning until dawn")
  await expect(panel.locator("[data-derived-tag]")).toHaveText("Reading list")
  await expect(panel.locator("[data-tag]")).toHaveText(["Sea", "sea"])
  await shot(panel, "side-panel.png")

  const dash = await openDashboard(context, extensionId)
  await expect(dash.getByTestId("note")).toHaveCount(4)
  await shot(dash, "dashboard.png")
})
