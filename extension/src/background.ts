import { currTab } from "$lib/chromey/utils"
import { option as O, array as A, record as R, map as M, number as N } from "fp-ts"
import { pushStore, getHighlightedText } from "$lib/chromey/messages"
import { derived, get, writable } from "svelte/store"
import { DEBUG, NoteDeri, NoteSync, createBookmarkStore, host, internalSearchParams, persisted, typeCast } from "$lib"
import type { Note, PendingNote } from "$lib"
import { NoteMut } from "$lib/note_mut"
import * as devalue from "devalue"

import { createChromeHandler } from "trpc-chrome/adapter"
import { z } from "zod"
import { createContext, t } from "./lib/chromey/trpc"
import { flow, identity, pipe } from "fp-ts/lib/function"
import { groupBy } from "fp-ts/lib/NonEmptyArray"

const bookmarkStore = createBookmarkStore()
// listeners must be registered synchronously at start so bookmark events wake the service worker
bookmarkStore.listen()
const note_sync = new NoteSync(bookmarkStore)
pushStore("noteStore", note_sync.noteStore)
pushStore("stuMapStore", note_sync.stuMapStore)
const noteDeri = new NoteDeri(note_sync)
pushStore("allTags", noteDeri.allTags)
note_sync.DEBUG = DEBUG
const currWindowId = writable(-1)
const note_mut: NoteMut = new NoteMut(note_sync, currWindowId)
pushStore("panels", note_mut.panels)

const newNote = (n: PendingNote, windowId?: number) => {
  const panel = get(note_mut.panels).get(windowId || -1) || []
  const commonTags = pipe(panel,
    A.flatMap(x => x.tags),
    groupBy(identity),
    R.filter(x => x.length == panel.length),
    R.keys,
  )
  const u = new URL(n.url)
  for (const p of internalSearchParams)
    u.searchParams.delete(p)
  const src = get(note_mut.currSrcs).get(windowId || -1)
  if (src) return note_sync.newNote({ ...n, url: u.href, title: src.title, tags: commonTags })
}
const wantsNoPrompt = persisted<boolean>("wantsNoPrompt", false, { serializer: devalue })

const appRouter = (() => {
  const tagChangeInput = z.tuple([z.string(), z.array(z.string())])
  const changePInput = z.tuple([z.string(), z.number()])

  return t.router({
    openDashboard: t.procedure.query(() => {
      chrome.tabs.create({ url: chrome.runtime.getURL("dashboard.html") })
    }),
    closeMe: t.procedure.query(({ ctx: { tab } }) => { if (tab?.id) chrome.tabs.remove(tab?.id) }),
    move2Prompt: t.procedure.input(z.string()).query(
      ({ input }) => chrome.tabs.update({ url: chrome.runtime.getURL("prompt.html") + "?id=" + input })),
    refresh: t.procedure.query(() => tabQueryUpdate()),
    hardReset: t.procedure.query(() => note_sync.hardReset()),
    // prompt
    requestedNoPrompt: t.procedure.query(() => get(wantsNoPrompt)),
    toggleNoPrompt: t.procedure.mutation(() => wantsNoPrompt.update(x => !x)),
    // forward note_sync
    tagChange: t.procedure.input(tagChangeInput).mutation(({ input }) => note_sync.tagChange(input[0])(input[1])),
    tagUpdate: t.procedure.input(typeCast<[string, O.Option<string>, string[]]>).mutation(({ input }) => note_sync.tagUpdate(...input)),
    changePrioritised: t.procedure.input(changePInput).mutation(({ input }) => note_sync.changePrioritised(input[0])(input[1])),
    deleteit: t.procedure.input(z.string()).mutation(({ input }) => note_sync.deleteit(input)),
    undo: t.procedure.query(() => note_sync.undo()),
    redo: t.procedure.query(() => note_sync.redo()),
    newNote: t.procedure.input(typeCast<PendingNote>).mutation(async ({ input, ctx: { tab } }) => await newNote(input, tab?.windowId)),
    updateNote: t.procedure.input(typeCast<Note>).mutation(({ input }) => note_sync.updateNote(input)),
    singleNoteLocal: t.procedure.input(z.string()).query(({ input }) => get(note_sync.noteStore).get(input)),
  })
})()
export type AppRouter = typeof appRouter

// @ts-expect-error
createChromeHandler({
  router: appRouter,
  createContext,
})

pushStore("currSrcs", note_mut.currSrcs)

note_sync.loadFromBookmarks()

const updateCurrUrl = (tab: chrome.tabs.Tab) => {
  const { url, title: _title } = tab
  // fix "(1) Messenger" as title
  const title = _title?.replace(/^\s*\(\s*[0-9]+\s*\)\s*/, "").replaceAll(/\s/gi, " ")
  const domain = O.toNullable(host(url || "")) // "" is fine here because it fails host()
  DEBUG && console.log(domain, title)
  currWindowId.set(tab.windowId)
  if (domain && title) note_mut.currSrcs.update(M.upsertAt(N.Eq)(tab.windowId, { domain, title }))
  else note_mut.currSrcs.update(M.deleteAt(N.Eq)(tab.windowId)) // ! here check if it doesn't delete when I dont want it to
}

const tabQueryUpdate = () => chrome.tabs.query({ active: true, lastFocusedWindow: true }).then(flow(A.lookup(0), O.map(updateCurrUrl)))
tabQueryUpdate()

chrome.tabs.onUpdated.addListener(async (_tabId, _info, _tab) => {
  const tab = await currTab()
  if (!tab) return
  updateCurrUrl(tab)
  setTimeout(async () => {
    const newTab = (await currTab())
    if (newTab && (tab.url !== newTab.url || tab.title !== newTab.title)) updateCurrUrl(newTab)
  }, 500)
})

chrome.tabs.onActivated.addListener(async () => {
  const tab = await currTab()
  if (tab) updateCurrUrl(tab)
})

const needsRefresh = writable(false)
pushStore("needsRefresh", needsRefresh)
const signalRefresh = (ms = 2000) => {
  needsRefresh.set(true)
  setTimeout(() => needsRefresh.set(false), ms)
}
async function activate(tab: chrome.tabs.Tab) {
  chrome.sidePanel.open({ tabId: tab.id } as chrome.sidePanel.OpenOptions)
  updateCurrUrl(tab)
  getHighlightedText.send(crypto.randomUUID(), { tabId: tab.id }).catch(() => signalRefresh())
}
// this makes it *not close* - it opens from the function above
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false })
chrome.action.onClicked.addListener(activate)

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "save",
    title: "Faro save",
    contexts: ["all"],
    documentUrlPatterns: ["<all_urls>"],
  })
})

chrome.contextMenus.onClicked.addListener((info, tab) =>
  info.menuItemId == "save" && tab && activate(tab))

if (DEBUG) console.log("loaded all background")

const notesCurrWindow = derived([currWindowId, note_mut.panels], ([id, panels]) =>
  panels.get(id)?.length || 0,
)
const setIcon = async (n: number, _tabId?: number) => {
  const tabId = _tabId || (await chrome.tabs.query({ active: true, lastFocusedWindow: true })).at(0)?.id
  return await chrome.action.setIcon({ path: chrome.runtime.getURL(
    n > 0 ? `icons/n_saved/icon${Math.min(n, 9)}.png` : "icons/icon48.png",
  ), tabId: tabId }).catch(console.log)
}
notesCurrWindow.subscribe(setIcon)
chrome.tabs.onUpdated.addListener((tabId, _info, _tab) => setIcon(get(notesCurrWindow), tabId))
