import { test as base, chromium, type BrowserContext, type Worker } from "@playwright/test"
import fs from "fs"
import os from "os"
import path from "path"

// The unpacked extension built by `npm run build:e2e` (VITE_E2E=true exposes the `__faro` test hook).
export const pathToExtension = path.join(__dirname, "../extension/dist-e2e")

/**
 * The browser to run: `$FARO_CHROMIUM` if set, else Playwright's own Chromium if installed, else the newest
 * Chromium / Chrome for Testing in the Playwright browser cache. (The Chromium build pinned by Playwright 1.42 can
 * no longer be downloaded; any Playwright version's `npx playwright@<ver> install chromium` fills the cache.)
 */
const chromiumPath = (): string | undefined => {
  if (process.env.FARO_CHROMIUM) return process.env.FARO_CHROMIUM
  if (fs.existsSync(chromium.executablePath())) return undefined
  const cache = process.env.PLAYWRIGHT_BROWSERS_PATH
    || (process.platform === "darwin"
      ? path.join(os.homedir(), "Library/Caches/ms-playwright")
      : process.platform === "win32"
        ? path.join(os.homedir(), "AppData/Local/ms-playwright")
        : path.join(os.homedir(), ".cache/ms-playwright"))
  const revisions = (fs.existsSync(cache) ? fs.readdirSync(cache) : [])
    .filter(d => /^chromium-\d+$/.test(d))
    .sort((a, b) => Number(b.split("-")[1]) - Number(a.split("-")[1]))
  for (const rev of revisions) {
    const dir = path.join(cache, rev)
    for (const sub of fs.readdirSync(dir)) {
      const candidates = [
        ...(fs.existsSync(path.join(dir, sub)) && fs.statSync(path.join(dir, sub)).isDirectory()
          ? fs.readdirSync(path.join(dir, sub)).filter(f => f.endsWith(".app"))
            .map(app => path.join(dir, sub, app, "Contents/MacOS", app.replace(/\.app$/, "")))
          : []),
        path.join(dir, sub, "chrome"), // linux
        path.join(dir, sub, "chrome.exe"), // windows
      ]
      const found = candidates.find(c => fs.existsSync(c))
      if (found) return found
    }
  }
  throw new Error(`No Chromium found. Set FARO_CHROMIUM, or run e.g. \`npx playwright@1.56 install chromium\` to fill ${cache}`)
}

/** Starts Chromium with the extension on the profile in `userDataDir`. */
export const launch = (userDataDir: string) => chromium.launchPersistentContext(userDataDir, {
  // extensions need Chrome's "new" headless mode; `headless: true` would pick the old one
  headless: false,
  executablePath: chromiumPath(),
  args: [
    ...(process.env.HEADED ? [] : ["--headless=new"]),
    `--disable-extensions-except=${pathToExtension}`,
    `--load-extension=${pathToExtension}`,
  ],
})

export const test = base.extend<{
  /** A fresh profile directory per test. */
  userDataDir: string
  context: BrowserContext
  extensionId: string
  /** The extension's background service worker, with the in-worker helpers from `installHelpers` set up. */
  sw: Worker
}>({
  userDataDir: async ({}, use) => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "faro-e2e-"))
    await use(dir)
    fs.rmSync(dir, { recursive: true, force: true })
  },
  context: async ({ userDataDir }, use) => {
    const context = await launch(userDataDir)
    await use(context)
    await context.close()
  },
  extensionId: async ({ sw }, use) => {
    await use(sw.url().split("/")[2])
  },
  sw: async ({ context }, use) => {
    await use(await serviceWorker(context))
  },
})
export const expect = test.expect

/** Waits for the extension's service worker and for its first full load from bookmarks. */
export const serviceWorker = async (context: BrowserContext) => {
  const sw = context.serviceWorkers()[0] ?? await context.waitForEvent("serviceworker")
  await expect.poll(() => sw.evaluate(() => "__faro" in globalThis).catch(() => false)).toBe(true)
  await sw.evaluate(installHelpers)
  await sw.evaluate(() => h.idle())
  return sw
}

// ---------- helpers that run inside the service worker ----------

type BTN = chrome.bookmarks.BookmarkTreeNode
type NoteLike = {
  id: string
  url: string
  title: string
  quote: string
  tags: string[]
  prioritised: number
  underFaro: boolean
  derivedTags: string[]
}
type Faro = {
  sync: {
    newNote: (i: { quote: string, url: string, title: string, tags: string[] }) => Promise<NoteLike | undefined>
    tagChange: (id: string) => (tags: string[]) => Promise<void>
    changePrioritised: (id: string) => (p: number) => Promise<void>
    tagUpdate: (old: string, nw: { _tag: "Some", value: string } | { _tag: "None" }, all: string[]) => Promise<void>
    deleteit: (id: string) => Promise<void>
    undo: () => Promise<void>
    redo: () => Promise<void>
    loadFromBookmarks: () => Promise<void>
  }
  store: { idle: () => Promise<void> }
  /** The background's NoteMut (side-panel state per window). */
  mut: { currSrcs: { update: (f: (m: Map<number, { domain: string, title: string }>) => Map<number, { domain: string, title: string }>) => void } }
  notes: () => NoteLike[]
  idbNotes: () => Promise<NoteLike[]>
  /** The "save" context-menu click on a tab. */
  contextMenuSave: (tabId: number) => Promise<unknown>
}
export type Helpers = {
  idle: () => Promise<void>
  /** Folder `path` below `parentId`, created as needed; returns its id. */
  folder: (parentId: string, path: string[]) => Promise<string>
  bookmark: (parentId: string, title: string, url: string) => Promise<BTN>
  get: (id: string) => Promise<BTN | undefined>
  /** Titles of the folders from the top-level browser folder down to the bookmark's parent. */
  pathOf: (id: string) => Promise<string[]>
  byUrl: (url: string) => Promise<BTN[]>
  /** URLs of all bookmarks whose URL starts with `prefix`. */
  urlsStartingWith: (prefix: string) => Promise<string[]>
  /** Folder titles of `Faro/` and below, as `a/b` paths (Faro itself is ""). */
  faroFolders: () => Promise<string[]>
  note: (url: string) => NoteLike | undefined
  notes: () => NoteLike[]
}

declare global {
  // eslint-disable-next-line no-var
  var __faro: Faro
  // eslint-disable-next-line no-var
  var h: Helpers
}

/** Evaluated in the service worker: defines `globalThis.h`. Must be self-contained (it is serialised). */
export function installHelpers() {
  const isFolder = (n: chrome.bookmarks.BookmarkTreeNode) => n.url === undefined
  const get = async (id: string) => {
    try {
      return (await chrome.bookmarks.get(id))[0]
    } catch {
      return undefined
    }
  }
  const faroId = async () =>
    (await chrome.bookmarks.getChildren("2")).find(c => isFolder(c) && c.title === "Faro")?.id
  globalThis.h = {
    idle: async () => {
      // let chrome.bookmarks events of the last writes arrive, then drain the store queue
      await new Promise(r => setTimeout(r, 50))
      await __faro.store.idle()
    },
    folder: async (parentId, path) => {
      let id = parentId
      for (const title of path) {
        const kids = await chrome.bookmarks.getChildren(id)
        id = kids.find(k => isFolder(k) && k.title === title)?.id
          ?? (await chrome.bookmarks.create({ parentId: id, title })).id
      }
      return id
    },
    bookmark: (parentId, title, url) => chrome.bookmarks.create({ parentId, title, url }),
    get,
    pathOf: async (id) => {
      const out: string[] = []
      let cur = (await get(id))?.parentId
      while (cur && cur !== "0") {
        const n = await get(cur)
        if (!n) break
        out.unshift(n.title)
        cur = n.parentId
      }
      return out
    },
    byUrl: async url => (await chrome.bookmarks.search({ url })).filter(b => b.url === url),
    urlsStartingWith: async (prefix) => {
      const walk = (n: chrome.bookmarks.BookmarkTreeNode): string[] =>
        n.url !== undefined ? [n.url] : (n.children ?? []).flatMap(walk)
      return walk((await chrome.bookmarks.getTree())[0]).filter(u => u.startsWith(prefix)).sort()
    },
    faroFolders: async () => {
      const id = await faroId()
      if (!id) return []
      const walk = (n: chrome.bookmarks.BookmarkTreeNode, p: string): string[] =>
        isFolder(n) ? [p, ...(n.children ?? []).flatMap(c => walk(c, p ? p + "/" + c.title : c.title))] : []
      return walk((await chrome.bookmarks.getSubTree(id))[0], "").sort()
    },
    note: url => __faro.notes().find(n => n.url === url),
    notes: () => __faro.notes(),
  }
}
