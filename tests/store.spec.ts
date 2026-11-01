// WS-E checks 1–7 (docs/1.0-implementation-plan.md) as far as they concern the BookmarkStore.
// Bookmarks are seeded and asserted through chrome.bookmarks inside the background service worker; saves and
// edits go through the background's NoteSync (the `__faro` hook of the e2e build).
import { expect, launch, serviceWorker, test } from "./fixtures"

const BAR = "1" // Bookmarks bar
const OTHER = "2" // Other bookmarks (Faro's parent)

test("1: plain bookmarks load with no quote and a derived folder tag; nothing moves", async ({ sw }) => {
  const seeded = await sw.evaluate(async ({ BAR }) => {
    const dir = await h.folder(BAR, ["My Stuff", "AC/DC"])
    const a = await h.bookmark(dir, "C# tips \"2024\" #notatag ⭐", "https://example.com/csharp")
    const b = await h.bookmark(BAR, "Top level", "https://example.com/top")
    return { a, b }
  }, { BAR })

  const check = async () => {
    await expect.poll(() => sw.evaluate(() => h.note("https://example.com/csharp"))).toMatchObject({
      title: "C# tips \"2024\" #notatag ⭐", // outside Faro/ the title is never parsed
      quote: "",
      tags: [],
      prioritised: 0,
      underFaro: false,
      derivedTags: ["My Stuff/AC∕DC"],
    })
    await expect.poll(() => sw.evaluate(() => h.note("https://example.com/top"))).toMatchObject({
      title: "Top level", quote: "", tags: [], derivedTags: [], underFaro: false,
    })
    await sw.evaluate(() => h.idle())
    const now = await sw.evaluate(async ({ a, b }) => ({
      a: await h.get(a.id), b: await h.get(b.id), faro: await h.faroFolders(),
    }), seeded)
    expect(now.a).toMatchObject({ title: seeded.a.title, url: seeded.a.url, parentId: seeded.a.parentId })
    expect(now.b).toMatchObject({ title: seeded.b.title, url: seeded.b.url, parentId: seeded.b.parentId })
    expect(now.faro).toEqual([]) // no Faro folder was created
  }
  await check() // incremental (onCreated)
  await sw.evaluate(() => __faro.sync.loadFromBookmarks())
  await check() // full load
})

test("2: a highlight adopts the page's plain bookmark (folder → tag, duplicates merged); later ones are new", async ({ sw }) => {
  // single plain bookmark in Bookmarks bar/My Stuff/AC/DC
  const page = "https://example.com/acdc"
  const first = page + "#:~:text=highway%20to%20hell"
  const orig = await sw.evaluate(async ({ BAR, page }) =>
    h.bookmark(await h.folder(BAR, ["My Stuff", "AC/DC"]), "AC/DC page", page), { BAR, page })
  await sw.evaluate(() => h.idle())
  const n1 = await sw.evaluate(({ first }) =>
    __faro.sync.newNote({ quote: "highway to hell", url: first, title: "AC/DC page", tags: [] }), { first })
  expect(n1).toMatchObject({ url: first, quote: "highway to hell", tags: ["My Stuff/AC∕DC"], underFaro: true })

  const after = await sw.evaluate(async ({ id }) => ({ bm: await h.get(id), path: await h.pathOf(id) }), { id: orig.id })
  expect(after.bm).toMatchObject({ url: first, title: "AC/DC page \"highway to hell\" #\"My Stuff/AC∕DC\"" })
  expect(after.path.slice(1)).toEqual(["Faro", "My Stuff", "AC∕DC"])
  expect(await sw.evaluate(({ page }) => h.urlsStartingWith(page), { page })).toEqual([first]) // no duplicate
  await expect.poll(() => sw.evaluate(({ page }) => h.note(page), { page })).toBeUndefined() // plain note replaced
  expect(await sw.evaluate(({ first }) => h.note(first), { first })).toMatchObject({ tags: ["My Stuff/AC∕DC"] })

  // a second highlight on the same page → a new bookmark
  const second = page + "#:~:text=back%20in%20black"
  const n2 = await sw.evaluate(({ second }) =>
    __faro.sync.newNote({ quote: "back in black", url: second, title: "AC/DC page", tags: [] }), { second })
  expect(n2).toMatchObject({ url: second, quote: "back in black", tags: [] })
  expect(await sw.evaluate(({ page }) => h.urlsStartingWith(page), { page })).toEqual([first, second].sort())
  expect(await sw.evaluate(({ id }) => h.get(id), { id: orig.id })).toMatchObject({ url: first }) // untouched

  // two plain bookmarks for one page in different folders → one bookmark with both folder tags
  const dup = "https://example.com/dup"
  const dupHl = dup + "#:~:text=merged"
  const [older, newer] = await sw.evaluate(async ({ BAR, OTHER, dup }) => [
    await h.bookmark(await h.folder(BAR, ["Recipes"]), "Dup", dup),
    await h.bookmark(await h.folder(OTHER, ["Work Stuff"]), "Dup again", dup),
  ], { BAR, OTHER, dup })
  await expect.poll(() => sw.evaluate(({ dup }) => h.note(dup), { dup }))
    .toMatchObject({ derivedTags: ["Recipes", "Work Stuff"], underFaro: false })
  const n3 = await sw.evaluate(({ dupHl }) =>
    __faro.sync.newNote({ quote: "merged", url: dupHl, title: "Dup", tags: [] }), { dupHl })
  expect(n3).toMatchObject({ tags: ["Recipes", "Work Stuff"], underFaro: true })
  expect(await sw.evaluate(({ dup }) => h.urlsStartingWith(dup), { dup })).toEqual([dupHl])
  const kept = await sw.evaluate(async ({ older, newer }) => ({
    older: await h.get(older), newer: await h.get(newer), path: await h.pathOf(older),
  }), { older: older.id, newer: newer.id })
  expect(kept.older).toMatchObject({ url: dupHl, title: "Dup \"merged\" #Recipes #\"Work Stuff\"" })
  expect(kept.newer).toBeUndefined() // merged into the oldest
  expect(kept.path.slice(1)).toEqual(["Faro", "Recipes"]) // deepest tag; tie → lexicographically smallest
})

test("3: tag a/b moves the note to Faro/a/b, star adds ⭐, undo reverts", async ({ sw }) => {
  const url = "https://example.com/three"
  const bm = await sw.evaluate(async ({ BAR, url }) => h.bookmark(await h.folder(BAR, ["Reading"]), "Three", url), { BAR, url })
  await expect.poll(() => sw.evaluate(({ url }) => h.note(url), { url })).toMatchObject({ derivedTags: ["Reading"] })
  const id = (await sw.evaluate(({ url }) => h.note(url), { url }))!.id
  const state = () => sw.evaluate(async ({ bm, url }) =>
    ({ bm: await h.get(bm), path: (await h.pathOf(bm)).slice(1), note: h.note(url), faro: await h.faroFolders() }), { bm: bm.id, url })

  // first interaction (tag) adopts: the folder path becomes a tag, the new tag is added
  await sw.evaluate(({ id }) => __faro.sync.tagChange(id)(["a/b"]), { id })
  let s = await state()
  expect(s.bm!.title).toBe("Three #Reading #a/b")
  expect(s.path).toEqual(["Faro", "a", "b"])
  expect(s.note).toMatchObject({ tags: ["Reading", "a/b"], underFaro: true, derivedTags: [] })

  await sw.evaluate(({ id }) => __faro.sync.changePrioritised(id)(5), { id })
  s = await state()
  expect(s.bm!.title).toBe("Three #Reading #a/b ⭐")
  expect(s.note).toMatchObject({ prioritised: 5 })

  await sw.evaluate(() => __faro.sync.undo()) // un-star
  s = await state()
  expect(s.bm!.title).toBe("Three #Reading #a/b")
  expect(s.note).toMatchObject({ prioritised: 0 })

  await sw.evaluate(() => __faro.sync.undo()) // un-tag (adoption itself stays)
  s = await state()
  expect(s.bm!.title).toBe("Three #Reading")
  expect(s.path).toEqual(["Faro", "Reading"])
  expect(s.faro).toEqual(["", "Reading"]) // Faro/a/b and Faro/a were empty → removed
  expect(s.note).toMatchObject({ tags: ["Reading"] })

  await sw.evaluate(() => __faro.sync.redo())
  s = await state()
  expect(s.bm!.title).toBe("Three #Reading #a/b")
  expect(s.path).toEqual(["Faro", "a", "b"])
})

test("4: renaming / deleting a tag across notes updates titles and folders, removes empty folders", async ({ sw }) => {
  const mk = (url: string, tags: string[]) => sw.evaluate(({ url, tags }) =>
    __faro.sync.newNote({ quote: "q", url, title: "T", tags }), { url, tags })
  const u1 = "https://example.com/four#:~:text=one", u2 = "https://example.com/four#:~:text=two", u3 = "https://example.com/four#:~:text=three"
  await mk(u1, ["x/y"])
  await mk(u2, ["x/y", "k"])
  await mk(u3, ["x"])
  const state = () => sw.evaluate(async ({ urls }) => {
    const out: Record<string, { title: string, path: string[], tags: string[] }> = {}
    for (const u of urls) {
      const [b] = await h.byUrl(u)
      out[u] = { title: b.title, path: (await h.pathOf(b.id)).slice(2), tags: h.note(u)!.tags }
    }
    return { notes: out, faro: await h.faroFolders() }
  }, { urls: [u1, u2, u3] })
  const allTags = () => sw.evaluate(() => [...new Set(h.notes().flatMap(n => n.tags))])

  let s = await state()
  expect(s.faro).toEqual(["", "x", "x/y"])

  // rename x → z (x/y follows as z/y)
  await sw.evaluate(({ all }) => __faro.sync.tagUpdate("x", { _tag: "Some", value: "z" }, all), { all: await allTags() })
  s = await state()
  expect(s.notes[u1]).toEqual({ title: "T \"q\" #z/y", path: ["z", "y"], tags: ["z/y"] })
  expect(s.notes[u2]).toEqual({ title: "T \"q\" #z/y #k", path: ["z", "y"], tags: ["z/y", "k"] })
  expect(s.notes[u3]).toEqual({ title: "T \"q\" #z", path: ["z"], tags: ["z"] })
  expect(s.faro).toEqual(["", "z", "z/y"])

  // delete z/y
  await sw.evaluate(({ all }) => __faro.sync.tagUpdate("z/y", { _tag: "None" }, all), { all: await allTags() })
  s = await state()
  expect(s.notes[u1]).toEqual({ title: "T \"q\"", path: [], tags: [] })
  expect(s.notes[u2]).toEqual({ title: "T \"q\" #k", path: ["k"], tags: ["k"] })
  expect(s.faro).toEqual(["", "k", "z"])

  // delete z → Faro/z is empty and removed
  await sw.evaluate(({ all }) => __faro.sync.tagUpdate("z", { _tag: "None" }, all), { all: await allTags() })
  s = await state()
  expect(s.notes[u3]).toEqual({ title: "T \"q\"", path: [], tags: [] })
  expect(s.faro).toEqual(["", "k"])
})

test("5: editing a Faro bookmark's title by hand updates the note (and its folder)", async ({ sw }) => {
  const url = "https://example.com/five#:~:text=orig"
  await sw.evaluate(({ url }) => __faro.sync.newNote({ quote: "orig", url, title: "Five", tags: ["t"] }), { url })
  const [bm] = await sw.evaluate(({ url }) => h.byUrl(url), { url })
  expect(bm.title).toBe("Five \"orig\" #t")

  await sw.evaluate(({ id }) => chrome.bookmarks.update(id, { title: "Five edited \"new quote\" #t #new ⭐" }), { id: bm.id })
  await expect.poll(() => sw.evaluate(({ url }) => h.note(url), { url })).toMatchObject({
    title: "Five edited", quote: "new quote", tags: ["t", "new"], prioritised: 5,
  })
  // folder follows the tags: deepest tag tie → lexicographically smallest ("new"); Faro/t is left empty → removed
  await expect.poll(() => sw.evaluate(async ({ id }) => (await h.pathOf(id)).slice(1), { id: bm.id })).toEqual(["Faro", "new"])
  await expect.poll(() => sw.evaluate(() => h.faroFolders())).toEqual(["", "new"])
  expect((await sw.evaluate(({ id }) => h.get(id), { id: bm.id }))!.title).toBe("Five edited \"new quote\" #t #new ⭐")
})

test("6: wiping IndexedDB and restarting rebuilds notes, tags and stars from bookmarks", async ({ context, sw, userDataDir }) => {
  const hl = "https://example.com/six#:~:text=keep%20me"
  await sw.evaluate(async ({ hl, BAR }) => {
    await __faro.sync.newNote({ quote: "keep me", url: hl, title: "Six", tags: ["p/q", "r s"] })
    const id = h.note(hl)!.id
    await __faro.sync.changePrioritised(id)(5)
    await h.bookmark(await h.folder(BAR, ["Plain"]), "Plain six", "https://example.com/six-plain")
    await h.idle()
  }, { hl, BAR })
  const pick = (ns: { url: string, title: string, quote: string, tags: string[], prioritised: number, underFaro: boolean, derivedTags: string[], id: string }[]) =>
    ns.map(({ id, url, title, quote, tags, prioritised, underFaro, derivedTags }) =>
      ({ id, url, title, quote, tags, prioritised, underFaro, derivedTags })).sort((a, b) => a.url.localeCompare(b.url))
  const before = pick(await sw.evaluate(() => h.notes()))
  expect(before).toHaveLength(2)
  expect(before.find(n => n.url === hl)).toMatchObject({ tags: ["p/q", "r s"], prioritised: 5, quote: "keep me" })
  await expect.poll(async () => pick(await sw.evaluate(() => __faro.idbNotes()))).toEqual(before)

  // wipe the IndexedDB cache, then restart the browser on the same profile (bookmarks stay, IndexedDB is empty)
  await sw.evaluate(() => new Promise<void>((resolve, reject) => {
    const open = indexedDB.open("keyval-store")
    open.onerror = () => reject(open.error)
    open.onsuccess = () => {
      const tx = open.result.transaction("keyval", "readwrite")
      tx.objectStore("keyval").clear()
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    }
  }))
  expect(await sw.evaluate(() => __faro.idbNotes())).toEqual([])
  await context.close()
  const context2 = await launch(userDataDir)
  try {
    const sw2 = await serviceWorker(context2)
    await expect.poll(async () => pick(await sw2.evaluate(() => h.notes()))).toEqual(before)
    await expect.poll(async () => pick(await sw2.evaluate(() => __faro.idbNotes()))).toEqual(before)
  } finally {
    await context2.close()
  }
})

test("7: a bookmark created under Faro/a/b with a schema title lands in the IndexedDB note store", async ({ sw }) => {
  const url = "https://example.com/seven#:~:text=quote"
  const bm = await sw.evaluate(async ({ OTHER, url }) =>
    h.bookmark(await h.folder(OTHER, ["Faro", "a", "b"]), "Page \"quote\" #a/b #\"x y\" ⭐", url), { OTHER, url })
  const expected = { url, title: "Page", quote: "quote", tags: ["a/b", "x y"], prioritised: 5, underFaro: true, derivedTags: [] }
  await expect.poll(() => sw.evaluate(({ url }) => h.note(url), { url })).toMatchObject(expected)
  await expect.poll(async () => (await sw.evaluate(() => __faro.idbNotes())).find(n => n.url === url)).toMatchObject(expected)
  await sw.evaluate(() => h.idle())
  // already in the folder of its deepest tag: not moved, title untouched
  expect(await sw.evaluate(({ id }) => h.get(id), { id: bm.id })).toMatchObject({ parentId: bm.parentId, title: bm.title })
})

test("deleting a note removes its bookmark(s); undo recreates it", async ({ sw }) => {
  const hl = "https://example.com/del#:~:text=gone"
  const plain = "https://example.com/del-plain"
  await sw.evaluate(async ({ hl, plain, BAR }) => {
    await __faro.sync.newNote({ quote: "gone", url: hl, title: "Del", tags: ["d/e"] })
    await h.bookmark(await h.folder(BAR, ["Keep"]), "Plain del", plain)
    await h.idle()
  }, { hl, plain, BAR })
  const ids = await sw.evaluate(({ hl, plain }) => [h.note(hl)!.id, h.note(plain)!.id], { hl, plain })

  for (const id of ids) await sw.evaluate(({ id }) => __faro.sync.deleteit(id), { id })
  expect(await sw.evaluate(({ hl, plain }) => Promise.all([h.byUrl(hl), h.byUrl(plain)]), { hl, plain })).toEqual([[], []])
  expect(await sw.evaluate(() => h.faroFolders())).toEqual([""]) // Faro/d/e and Faro/d removed
  expect(await sw.evaluate(({ hl, plain }) => [h.note(hl), h.note(plain)], { hl, plain })).toEqual([undefined, undefined])

  await sw.evaluate(() => __faro.sync.undo()) // plain one comes back where it was
  const [p] = await sw.evaluate(({ plain }) => h.byUrl(plain), { plain })
  expect(p.title).toBe("Plain del")
  expect((await sw.evaluate(({ id }) => h.pathOf(id), { id: p.id })).slice(1)).toEqual(["Keep"])
  expect(await sw.evaluate(({ plain }) => h.note(plain), { plain })).toMatchObject({ underFaro: false, derivedTags: ["Keep"] })

  await sw.evaluate(() => __faro.sync.undo()) // highlight comes back under Faro/d/e
  const [b] = await sw.evaluate(({ hl }) => h.byUrl(hl), { hl })
  expect(b.title).toBe("Del \"gone\" #d/e")
  expect((await sw.evaluate(({ id }) => h.pathOf(id), { id: b.id })).slice(1)).toEqual(["Faro", "d", "e"])
})

test("a burst of bookmark events converges to the state of a full reload", async ({ sw }) => {
  const snapshot = () => sw.evaluate(() => h.notes()
    .map(({ id, url, title, quote, tags, prioritised, underFaro, derivedTags }) =>
      ({ id, url, title, quote, tags, prioritised, underFaro, derivedTags }))
    .sort((a, b) => a.url.localeCompare(b.url)))
  await sw.evaluate(async ({ BAR, OTHER }) => {
    // fire everything without waiting for the store (as a Chrome Sync burst would)
    const dir = await h.folder(BAR, ["Burst", "Inner"])
    const faroX = await h.folder(OTHER, ["Faro", "x"])
    const made = await Promise.all([
      h.bookmark(dir, "P1", "https://example.com/b1"),
      h.bookmark(dir, "P1 dup", "https://example.com/b1"),
      h.bookmark(BAR, "P2", "https://example.com/b2"),
      h.bookmark(faroX, "F1 \"q1\" #x ⭐", "https://example.com/f1#:~:text=q1"),
      h.bookmark(faroX, "F2 \"q2\" #y/z", "https://example.com/f2#:~:text=q2"), // misfiled: moves to Faro/y/z
    ])
    await Promise.all([
      chrome.bookmarks.update(dir, { title: "Renamed" }), // folder rename → derived tags change
      chrome.bookmarks.move(made[2].id, { parentId: dir }),
      chrome.bookmarks.update(made[3].id, { title: "F1 \"q1 edited\" #x 🗄️" }),
      chrome.bookmarks.remove(made[1].id),
    ])
  }, { BAR, OTHER })
  await expect.poll(async () => {
    await sw.evaluate(() => h.idle())
    return (await snapshot()).find(n => n.url === "https://example.com/b2")?.derivedTags
  }).toEqual(["Burst/Renamed"])
  await expect.poll(() => sw.evaluate(() => h.faroFolders())).toEqual(["", "x", "y", "y/z"])
  await sw.evaluate(() => h.idle())
  const incremental = await snapshot()
  expect(incremental).toHaveLength(4)
  expect(incremental.find(n => n.url === "https://example.com/b1")).toMatchObject({ derivedTags: ["Burst/Renamed"] })
  expect(incremental.find(n => n.url.startsWith("https://example.com/f1"))).toMatchObject({ quote: "q1 edited", prioritised: -5 })

  await sw.evaluate(() => __faro.sync.loadFromBookmarks())
  expect(await snapshot()).toEqual(incremental)
})
