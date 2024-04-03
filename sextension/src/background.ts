import { API_ADDRESS, DEBUG, getSession } from "$lib/utils"
import { option as O } from "fp-ts"
import { pushStore, optimisticNotes, getHighlightedText } from "$lib/chromey/messages"
import { derived, get, writable } from "svelte/store"
import { NoteDeri, NoteSync, domain_title, escapeRegExp, hostname, schemas, type NoteEx, type PendingNote, type Src } from "shared"
import { trpc2 } from "$lib/trpc-client"
import type { Session } from "@supabase/supabase-js"
import { supabase } from "$lib/chromey/bg"
import { NoteMut } from "$lib/note_mut"

import { createChromeHandler } from "trpc-chrome/adapter"
import { z } from "zod"
import { createContext, t } from "./lib/chromey/trpc"

const T = trpc2()

const note_sync = new NoteSync(supabase, undefined, "chrome")
pushStore("noteStore", note_sync.noteStore)
pushStore("stuMapStore", note_sync.stuMapStore)
const noteDeri = new NoteDeri(note_sync)
pushStore("allTags", noteDeri.allTags)
note_sync.DEBUG = DEBUG
const note_mut: NoteMut = new NoteMut(note_sync)
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
    note_sync.sub()
  })
user_id.subscribe(onUser_idUpdate)

const refresh = async () => {
  const toks = await T.my_tokens.query() // .then((x) => console.log("bg tokens", x))
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
  const addZ = z.tuple([z.number(), z.number()])
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

    refresh: t.procedure.query(refresh),
    // forward note_sync
    tagChange: t.procedure.input(tagChangeInput).mutation(({ input }) => note_sync.tagChange(input[0])(input[1])),
    tagUpdate: t.procedure.input(typeCast<[string, O.Option<string>]>).mutation(({ input }) => note_sync.tagUpdate(...input)),
    changePrioritised: t.procedure.input(changePInput).mutation(({ input }) => note_sync.changePrioritised(input[0])(input[1])),
    deleteit: t.procedure.input(z.string()).mutation(({ input }) => note_sync.deleteit(input)),
    undo: t.procedure.query(note_sync.undo),
    redo: t.procedure.query(note_sync.redo),
    newNote: t.procedure.input(typeCast<PendingNote>).mutation(({ input }) => note_sync.newNote(input, get(currSrc))),

    // forward note_mut

  })
})()
export type AppRouter = typeof appRouter

// @ts-expect-error
createChromeHandler({
  router: appRouter,
  createContext,
})

const currSrc = writable<Src>({ url: "", title: "" })
pushStore("currSrc", currSrc)

const updateCurrUrl = (tab: chrome.tabs.Tab) => {
  // chrome.runtime.sendMessage({ action: "update_curr_url" }).catch(e => DEBUG && console.log("no sidebar")) // TODO: remove
  const { url, title } = tab
  if (url && title) currSrc.set({ url, title })
  const source_id = note_mut.setLocalSrcId({ url: url || "", title: title || "" })
  // console.log("new src&id:", get(note_mut.currSrcnId))
}

const apiHostname = O.getOrElse(() => "")(hostname(API_ADDRESS))
chrome.tabs.onUpdated.addListener((tabId, info, tab) => {
  // here closes the window
  if (RegExp(escapeRegExp(apiHostname) + "/account").test(tab.url || ""))
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

// chrome.commands.onCommand.addListener((command) => {
//   const api_regexp = RegExp(escapeRegExp(API_ADDRESS))
//   if (command == "search" && !api_regexp.test(get(currSrc).url)) {
//     chrome.tabs.create({ url: `${API_ADDRESS}/dashboard?search` })
//   }
// })

if (DEBUG) console.log("loaded all background")
