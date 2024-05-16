import { getSetSession } from "$lib/utils"
import { option as O, array as A, record as R, map as M, number as N, taskOption as TO, ord } from "fp-ts"
import { pushStore, getHighlightedText, checkGoto } from "$lib/chromey/messages"
import { derived, get, writable } from "svelte/store"
import { API_ADDRESS, DEBUG, NoteDeri, NoteSync, escapeRegExp, funLog, host, internalSearchParams, note_idKey, typeCast, type Notes, type PendingNote } from "shared"
import { trpc2 } from "$lib/trpc-client"
import type { Session } from "@supabase/supabase-js"
import { supabase } from "$lib/chromey/bg"
import { NoteMut } from "$lib/note_mut"

import { createChromeHandler } from "trpc-chrome/adapter"
import { z } from "zod"
import { createContext, t } from "./lib/chromey/trpc"
import { identity, pipe } from "fp-ts/lib/function"
import { groupBy } from "fp-ts/lib/NonEmptyArray"

const T = trpc2()

const note_sync = new NoteSync(supabase, undefined, T.online.query)
pushStore("noteStore", note_sync.noteStore)
pushStore("stuMapStore", note_sync.stuMapStore)
const noteDeri = new NoteDeri(note_sync)
pushStore("allTags", noteDeri.allTags)
note_sync.DEBUG = DEBUG
const note_mut: NoteMut = new NoteMut(note_sync)
pushStore("panels", note_mut.panels)
const sess = writable<O.Option<Session>>(O.none)
pushStore("session", sess)
const user_id = derived(sess, O.map(s => s.user.id))
// on user/session run:
const onUser_idUpdate = O.match(
  () => note_sync.setUser_id(undefined),
  async (user_id: string) => {
    note_sync.setUser_id(user_id)
    note_sync.refresh_sources()
    note_sync.refresh_notes()
  })
user_id.subscribe(onUser_idUpdate)

const refresh = async (online = true) => {
  const tab = (await chrome.tabs.query({ active: true, lastFocusedWindow: true })).at(0)
  if (tab) updateCurrUrl(tab)
  const toks = (online && O.toNullable(await TO.tryCatch(T.my_tokens.query)())) || undefined
  funLog("refresh toks")(toks)
  if (!toks) { // logged out
    sess.set(O.none)
    return O.none
  }
  const newSess = O.fromNullable(await getSetSession(supabase, toks))
  sess.set(newSess)
  return newSess
}
refresh()
// const refreshIfNew = async () => {  // premature opt
//   const toks = await T.my_tokens.query() // .then((x) => console.log("bg tokens", x))
//   const newSess = O.fromNullable(await getSession(supabase, toks))
//   const optMail = O.match<Session, string>(() => "", x => x.user.email || "")
//   optMail(get(sess)) != optMail(newSess) && sess.set(newSess)
//   return newSess
// }
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
  n.url = u.href
  const src = get(note_mut.currSrcs).get(windowId || -1)
  if (src)
    return note_sync.newNote({ ...n, tags: commonTags }, src)
}
const email = derived(sess, s => O.toNullable(s)?.user?.email)
const tabs2Check: number[] = []
const appRouter = (() => {
  const tagChangeInput = z.tuple([z.string(), z.array(z.string())])
  const changePInput = z.tuple([z.string(), z.number()])

  return t.router({
    openDashboard: t.procedure.query(() => {
      const url = get(email) ? `${API_ADDRESS}/dashboard` : chrome.runtime.getURL("dashboard.html")
      chrome.tabs.create({ url })
    }),
    serializedHighlights: t.procedure.query(({ ctx: { tab } }) =>
      (get(note_mut.panels).get(tab?.windowId || -1) || []).map(n => [n.snippet_uuid, n.serialized_highlight] as [string, string])), // !
    tab4Check: t.procedure.input(z.number()).mutation(({ input }) => tabs2Check.push(input)),
    loadDeps: t.procedure.query(({ ctx: { tab } }) => {
      if (!tab) return
      chrome.scripting.executeScript({
        target: { tabId: tab.id! },
        files: ["rangy/rangy-core.min.js", "rangy/rangy-classapplier.min.js", "rangy/rangy-highlighter.min.js"],
      })
      if (tabs2Check.includes(tab.id!))
        setTimeout(() => checkGoto.send(undefined, { tabId: tab.id! }), 550)
    }),
    closeMe: t.procedure.query(({ ctx: { tab } }) => { if (tab?.id) chrome.tabs.remove(tab?.id) }),
    move2Prompt: t.procedure.input(z.string()).query(
      ({ input }) => chrome.tabs.update({ url: chrome.runtime.getURL("prompt.html") + "?id=" + input })),
    refresh: t.procedure.query(() => refresh()),
    disconnect: t.procedure.query(() => refresh(false)),
    // forward note_sync
    tagChange: t.procedure.input(tagChangeInput).mutation(({ input }) => note_sync.tagChange(input[0])(input[1])),
    tagUpdate: t.procedure.input(typeCast<[string, O.Option<string>]>).mutation(({ input }) => note_sync.tagUpdate(...input)),
    changePrioritised: t.procedure.input(changePInput).mutation(({ input }) => note_sync.changePrioritised(input[0])(input[1])),
    deleteit: t.procedure.input(z.string()).mutation(({ input }) => note_sync.deleteit(input)),
    undo: t.procedure.query(() => note_sync.undo()),
    redo: t.procedure.query(() => note_sync.redo()),
    newNote: t.procedure.input(typeCast<PendingNote>).mutation(async ({ input, ctx: { tab } }) => await newNote(input, tab?.windowId)),
    updateNote: t.procedure.input(typeCast<Notes>).mutation(({ input }) => note_sync.updateNote(input)),
    // forward t
    singleNote: t.procedure.input(z.string()).query(async ({ input }) => await T.singleNote.query(input)),
    singleNoteLocal: t.procedure.input(z.string()).query(({ input }) => get(note_sync.noteStore).get(input)),

    singleNoteBySnippetId: t.procedure.input(z.string()).query(({ input }) =>
      pipe(get(note_mut.panels),
        M.values(pipe(N.Ord, ord.contramap(x => x.length))),
        A.flatten,
        A.findFirst(a => a.snippet_uuid == input), O.toNullable),
    ),
  })
})()
export type AppRouter = typeof appRouter

// @ts-expect-error
createChromeHandler({
  router: appRouter,
  createContext,
})
// note_mut.currSrc
// const currSrc = writable<Src>({ domain: "", title: "" })

pushStore("currSrcs", note_mut.currSrcs)

const apiHostname = API_ADDRESS.replace(/http(s?):\/\//, "")
const homeRegexp = RegExp(escapeRegExp(apiHostname) + "[(/account)(/dashboard)]")
// const noteTestRegexp = RegExp(escapeRegExp(apiHostname) + "/notes/test/")
const noteRegexp = RegExp(escapeRegExp(apiHostname) + "/notes/")

const updateCurrUrl = (tab: chrome.tabs.Tab) => {
  const { url, title: _title } = tab
  // fix "(1) Messenger" as title
  const title = _title?.replace(/^\s*\(\s*[0-9]+\s*\)\s*/, "").replaceAll(/\s/gi, " ")
  if (url && noteRegexp.test(url)) {
    const note_id = (/(?<=\/notes\/).+/.exec(url))![0]
    T.singleNote.query(note_id).then(({ data }) => {
      const newUrlStr = data?.url
      if (newUrlStr) {
        const newUrl = new URL(newUrlStr)
        newUrl.searchParams.set(note_idKey, note_id)
        chrome.tabs.update({ url: newUrl.toString() })
      }
    })
    return
  }
  if (url && homeRegexp.test(url))
    refresh()
  const domain = O.toNullable(host(url || "")) // "" is fine here because it fails host()
  DEBUG && console.log(domain, title)
  note_mut.currWindowId.set(tab.windowId)
  if (domain && title) note_mut.currSrcs.update(M.upsertAt(N.Eq)(tab.windowId, { domain, title }))
}

chrome.tabs.onUpdated.addListener(async (tabId, info, _tab) => {
  // here closes the window
  const tab = (await chrome.tabs.query({ active: true, lastFocusedWindow: true })).at(0)
  if (!tab) throw new Error("unreachable")
  if (homeRegexp.test(tab.url || ""))
    chrome.sidePanel.setOptions({ enabled: false }).then(() => chrome.sidePanel.setOptions({ enabled: true }))
  updateCurrUrl(tab)

  setTimeout(async () => {
    const newTab = (await chrome.tabs.query({ active: true, lastFocusedWindow: true })).at(0)
    if (newTab && (tab.url !== newTab.url || tab.title !== newTab.title)) updateCurrUrl(newTab)
  }, 500)
})

chrome.tabs.onActivated.addListener(({ tabId }) => {
  // should I close window here too? prolly not in case i send notifications or sth
  chrome.tabs.get(tabId).then(updateCurrUrl)
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
  // tODo here check if online at all
  getHighlightedText.send(crypto.randomUUID(), { tabId: tab.id }).catch(() => signalRefresh())
}
// this makes it *not close* - it opens from the function above
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false })
chrome.action.onClicked.addListener(activate)

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "save",
    title: "Faros save",
    contexts: ["all"],
    documentUrlPatterns: ["<all_urls>"],
  })
})

chrome.contextMenus.onClicked.addListener((info, tab) =>
  info.menuItemId == "save" && tab && activate(tab))

// chrome.commands.onCommand.addListener((command) => {
//   const api_regexp = RegExp(escapeRegExp(API_ADDRESS))
//   if (command == "search" && !api_regexp.test(get(currSrc).url)) {
//     chrome.tabs.create({ url: `${API_ADDRESS}/dashboard?search` })
//   }
// })

if (DEBUG) console.log("loaded all background")

chrome.runtime.onInstalled.addListener((e) => {
  if (e.reason === chrome.runtime.OnInstalledReason.INSTALL)
    chrome.tabs.create({ url: API_ADDRESS + "/welcome" })
})
