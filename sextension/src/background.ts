import { currTab, getSetSession } from "$lib/utils"
import { option as O, array as A, record as R, map as M, number as N, taskOption as TO, ord } from "fp-ts"
import { pushStore, getHighlightedText } from "$lib/chromey/messages"
import { derived, get, writable } from "svelte/store"
import { API_ADDRESS, DEBUG, NoteDeri, NoteSync, escapeRegExp, funLog, funLog2, host, internalSearchParams, note_idKey, persisted, sbLogger, syncBookmarks, typeCast, type Notes, type PendingNote } from "shared"
import { trpc2 } from "$lib/trpc-client"
import type { Session } from "@supabase/supabase-js"
import { supabase } from "$lib/chromey/bg"
import { NoteMut } from "$lib/note_mut"
import * as devalue from "devalue"

import { createChromeHandler } from "trpc-chrome/adapter"
import { z } from "zod"
import { createContext, t } from "./lib/chromey/trpc"
import { flow, identity, pipe } from "fp-ts/lib/function"
import { groupBy } from "fp-ts/lib/NonEmptyArray"

const S = trpc2()

const note_sync = new NoteSync(supabase, undefined, S.online.query)
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
const onUser_idUpdate = O.matchW(
  () => note_sync.setUser_id(undefined),
  note_sync.setUser_id,
)
user_id.subscribe(onUser_idUpdate)

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
  if (src) return note_sync.newNote({ ...n, tags: commonTags }, src)
}
const email = derived(sess, s => O.toNullable(s)?.user?.email)
const wantsNoPrompt = persisted<boolean>("wantsNoPrompt", false, { serializer: devalue })
// const tabs2Check: number[] = []
const log = funLog2(sbLogger(supabase))
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
    loadDeps: t.procedure.query(({ ctx: { tab } }) => {
      if (!tab) return
      chrome.scripting.executeScript({
        target: { tabId: tab.id! },
        files: ["rangy/rangy-core.min.js", "rangy/rangy-classapplier.min.js", "rangy/rangy-highlighter.min.js"],
      })
    }),
    closeMe: t.procedure.query(({ ctx: { tab } }) => { if (tab?.id) chrome.tabs.remove(tab?.id) }),
    move2Prompt: t.procedure.input(z.string()).query(
      ({ input }) => chrome.tabs.update({ url: chrome.runtime.getURL("prompt.html") + "?id=" + input })),
    refresh: t.procedure.query(() => refresh()),
    disconnect: t.procedure.query(() => refresh(false)),
    // prompt
    requestedNoPrompt: t.procedure.query(() => get(wantsNoPrompt)),
    toggleNoPrompt: t.procedure.mutation(() => wantsNoPrompt.update(x => !x)),
    // BOOKMARKS
    syncBookmarks: t.procedure.query(() => syncBookmarks(get(noteDeri.noteArr)).then(log("syncBookmarks"))),
    // requestedNoPrompt: t.procedure.query(async () => await supabase.from("profiles").select("")),
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
    singleNote: t.procedure.input(z.string()).query(async ({ input }) => await S.singleNote.query(input)),
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
    S.singleNote.query(note_id).then(({ data }) => {
      const newUrlStr = data?.url
      if (newUrlStr) {
        const newUrl = new URL(newUrlStr)
        newUrl.searchParams.set(note_idKey, note_id)
        chrome.tabs.update({ url: newUrl.toString() })
      }
    })
    return
  }

  const domain = O.toNullable(host(url || "")) // "" is fine here because it fails host()
  DEBUG && console.log(domain, title)
  note_mut.currWindowId.set(tab.windowId)
  if (domain && title) note_mut.currSrcs.update(M.upsertAt(N.Eq)(tab.windowId, { domain, title }))
}

const tabQueryUpdate = () => chrome.tabs.query({ active: true, lastFocusedWindow: true }).then(flow(A.lookup(0), O.map(updateCurrUrl)))

let toks: Awaited<ReturnType<typeof S.my_tokens.query>> = undefined
const refreshOnline = async () => {
  const newToks = pipe(await TO.tryCatch(S.my_tokens.query)(), O.toUndefined)
  funLog("refresh toks")([toks, newToks])
  if ((newToks?.access_token == toks?.access_token) && O.isSome(get(sess))) {
    note_sync.refresh()
    return get(sess)
  }
  toks = newToks
  const s = O.fromNullable(toks && await getSetSession(supabase, toks))
  sess.set(s)
  return s
}

chrome.runtime.onMessageExternal.addListener(
  function (request, sender, sendResponse) {

  })


// let lastSess: O.Option<Session> = O.none
// sess.subscribe((sOpt) => {
//   lastSess = sOpt
//   funLog("sOpt")(sOpt)
//   if (O.isNone(sOpt)) return

//   const s = sOpt.value
//   if (O.isSome(lastSess) && s.refresh_token == lastSess.value.refresh_token) return
//   funLog("s.expires_at")(s.expires_at)
//   funLog("s.expires_in")(s.expires_in)
//   // s.expires_at ? s.expires_at - Date.now() :
//   const retryInMs = (s.expires_in - 60) * 1000 // ms to refresh in - 60 secs before supabase client will retry, so get in front
//   setTimeout(refreshSess, retryInMs) // ! this will mess up trying to simulate offline
// })

const refresh = async (online = true) => {
  tabQueryUpdate()
  if (online) return await refreshOnline()
  sess.set(O.none) // if offline
  return get(sess)
}
const updateRefresh = (tab: chrome.tabs.Tab) => {
  updateCurrUrl(tab)
  if (tab.url && homeRegexp.test(tab.url))
    refresh()
}
refresh()

chrome.tabs.onUpdated.addListener(async (tabId, info, _tab) => {
  // here closes the window
  const tab = await currTab()
  if (!tab) throw new Error("unreachable")
  if (homeRegexp.test(tab.url || ""))
    chrome.sidePanel.setOptions({ enabled: false }).then(() => chrome.sidePanel.setOptions({ enabled: true }))

  updateRefresh(tab)
  setTimeout(async () => {
    const newTab = (await currTab())
    if (newTab && (tab.url !== newTab.url || tab.title !== newTab.title)) updateRefresh(newTab)
  }, 500)
})

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  const tab = await chrome.tabs.get(tabId)
  updateRefresh(tab)
  if (homeRegexp.test(tab.url || ""))
    chrome.sidePanel.setOptions({ enabled: false }).then(() => chrome.sidePanel.setOptions({ enabled: true }))
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

if (DEBUG) console.log("loaded all background")

chrome.runtime.onInstalled.addListener((e) => {
  if (e.reason === chrome.runtime.OnInstalledReason.INSTALL)
    chrome.tabs.create({ url: API_ADDRESS + "/welcome" })
})
chrome.runtime.setUninstallURL(API_ADDRESS + "/farewell")
