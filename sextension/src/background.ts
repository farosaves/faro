import { getSession } from "$lib/utils"
import { option as O, array as A } from "fp-ts"
import { pushStore, getHighlightedText } from "$lib/chromey/messages"
import { derived, get, writable } from "svelte/store"
import { API_ADDRESS, DEBUG, NoteDeri, NoteSync, escapeRegExp, funLog, hostname, type Notes, type PendingNote, type Src } from "shared"
import { trpc2 } from "$lib/trpc-client"
import type { Session } from "@supabase/supabase-js"
import { supabase } from "$lib/chromey/bg"
import { NoteMut } from "$lib/note_mut"

import { createChromeHandler } from "trpc-chrome/adapter"
import { z } from "zod"
import { createContext, t } from "./lib/chromey/trpc"
import { pipe } from "fp-ts/lib/function"

const T = trpc2()

const note_sync = new NoteSync(supabase, undefined, T.online.query)
pushStore("noteStore", note_sync.noteStore)
pushStore("stuMapStore", note_sync.stuMapStore)
const noteDeri = new NoteDeri(note_sync)
pushStore("allTags", noteDeri.allTags)
note_sync.DEBUG = DEBUG
const note_mut: NoteMut = new NoteMut(note_sync)
// note_mut.panel.subscribe(funLog("note_panel"))
pushStore("panel", note_mut.panel)
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
  const toks = (online && await T.my_tokens.query().catch(funLog("toks"))) || undefined
  const newSess = O.fromNullable(await getSession(supabase, toks))
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
const typeCast = <T>(input: unknown) => input as T
const appRouter = (() => {
  const tagChangeInput = z.tuple([z.string(), z.array(z.string())])
  const changePInput = z.tuple([z.string(), z.number()])

  return t.router({
    serializedHighlights: t.procedure.query(() => get(note_mut.panel).map(n => [n.snippet_uuid, n.serialized_highlight] as [string, string])), // !
    loadDeps: t.procedure.query(({ ctx: { tab } }) => {
      chrome.scripting.executeScript({
        // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
        target: { tabId: tab?.id! },
        files: ["rangy/rangy-core.min.js", "rangy/rangy-classapplier.min.js", "rangy/rangy-highlighter.min.js"],
      })
    }),

    refresh: t.procedure.query(() => refresh()),
    disconnect: t.procedure.query(() => refresh(false)),
    // forward note_sync
    tagChange: t.procedure.input(tagChangeInput).mutation(({ input }) => note_sync.tagChange(input[0])(input[1])),
    tagUpdate: t.procedure.input(typeCast<[string, O.Option<string>]>).mutation(({ input }) => note_sync.tagUpdate(...input)),
    changePrioritised: t.procedure.input(changePInput).mutation(({ input }) => note_sync.changePrioritised(input[0])(input[1])),
    deleteit: t.procedure.input(z.string()).mutation(({ input }) => note_sync.deleteit(input)),
    undo: t.procedure.query(() => note_sync.undo()),
    redo: t.procedure.query(() => note_sync.redo()),
    newNote: t.procedure.input(typeCast<PendingNote>).mutation(({ input }) => note_sync.newNote(input, get(currSrc))),
    updateNote: t.procedure.input(typeCast<Notes>).mutation(({ input }) => note_sync.updateNote(input)),
    // forward t
    singleNote: t.procedure.input(z.string()).query(async ({ input }) => await T.singleNote.query(input)),
    singleNoteBySnippetId: t.procedure.input(z.string()).query(({ input }) =>
      pipe(get(note_mut.panel), A.findFirst(a => a.snippet_uuid == input), O.toNullable)),
  })
})()
export type AppRouter = typeof appRouter

// @ts-expect-error
createChromeHandler({
  router: appRouter,
  createContext,
})

const currSrc = writable<Src>({ domain: "", title: "" })
pushStore("currSrc", currSrc)

const updateCurrUrl = (tab: chrome.tabs.Tab) => {
  const { url, title } = tab
  // const domain = pipe(url, O.fromNullable, O.chain(hostname), O.toNullable)
  const domain = O.toNullable(hostname(url || "")) // "" is fine here because it will fail later
  if (domain && title) currSrc.set({ domain, title })
  const source_id = note_mut.setLocalSrcId({ domain: domain || "", title: title || "" })
}

const apiHostname = API_ADDRESS.replace(/http(s?):\/\//, "")
const homeRegexp = RegExp(escapeRegExp(apiHostname) + "[(/account)(/dashboard)]")

chrome.tabs.onUpdated.addListener((tabId, info, tab) => {
  // here closes the window
  if (homeRegexp.test(tab.url || ""))
    chrome.sidePanel.setOptions({ enabled: false }).then(() => chrome.sidePanel.setOptions({ enabled: true }))
  updateCurrUrl(tab)
})

chrome.tabs.onActivated.addListener(({ tabId }) => {
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
