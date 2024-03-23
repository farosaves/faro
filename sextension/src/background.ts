import { API_ADDRESS, getSession } from "$lib/utils"
import { option as O } from "fp-ts"
import { pushStore, pendingNotes, getHighlightedText } from "$lib/chromey/messages"
import { derived, get, writable } from "svelte/store"
import { NoteSync, domain_title, escapeRegExp, schemas, type NoteEx } from "shared"
import { trpc2 } from "$lib/trpc-client"
import type { Session } from "@supabase/supabase-js"
import { supabase } from "$lib/chromey/bg"
import { NoteMut, type Src } from "$lib/note_mut"

import { createChromeHandler } from "trpc-chrome/adapter"
import { z } from "zod"
import { createContext, t } from "./lib/chromey/trpc"

const DOMAIN = import.meta.env.VITE_PI_IP.replace(/\/$/, "")
const DEBUG = import.meta.env.DEBUG || false

const T = trpc2()

const note_sync: NoteSync = new NoteSync(supabase, undefined)
pushStore("allTags", note_sync.alltags)
const note_mut: NoteMut = new NoteMut(note_sync)
pushStore("panel", note_mut.panel)
const sess = writable<O.Option<Session>>(O.none)
const user_id = derived(sess, O.map(s => s.user.id))
// on user/session run:
const onUser_idUpdate = O.map((user_id: string) => {
  note_sync.setUid(user_id)
  note_sync.refresh_sources()
  note_sync.refresh_notes()
  note_sync.sub()
})
user_id.subscribe(onUser_idUpdate)

const refresh = async () => {
  const toks = await T.my_tokens.query() // .then((x) => console.log("bg tokens", x))
  const newSess = O.fromNullable(await getSession(supabase, toks))
  sess.update(n => O.orElse(newSess, () => n))
}
refresh()

const appRouter = (() => {
  const addZ = z.tuple([z.number(), z.number()])
  const tagChangeInput = z.tuple([z.string(), z.string(), z.array(z.string())])
  const changePInput = z.tuple([z.string(), z.number()])

  return t.router({
    serializedHighlights: t.procedure.query(() => get(note_mut.panel).map(n => [n.snippet_uuid, n.serialized_highlight] as [string, string])), // !
    add: t.procedure.input(addZ).query(({ input }) => input[0] + input[1]),
    loadDeps: t.procedure.query(({ ctx: { tab } }) => {
      chrome.scripting.executeScript({
        target: { tabId: tab?.id! },
        files: ["rangy/rangy-core.min.js", "rangy/rangy-classapplier.min.js", "rangy/rangy-highlighter.min.js"],
      })
    }),
    tagChange: t.procedure.input(tagChangeInput).mutation(({ input }) => note_sync.tagChange(input[0])(input[1], input[2])),
    changePrioritised: t.procedure.input(changePInput).mutation(({ input }) => note_sync.changePrioritised(input[0])(input[1])),
    deleteit: t.procedure.input(z.string()).mutation(({ input }) => note_sync.deleteit(input)),
  })
})()
export type AppRouter = typeof appRouter

// @ts-expect-error
createChromeHandler({
  router: appRouter,
  createContext,
})

const currSrc = writable<Src>({ url: "", title: "" })
pushStore("currSrcMutBg", note_mut.currSrcNId)

const updateCurrUrl = (tab: chrome.tabs.Tab) => {
  chrome.runtime.sendMessage({ action: "update_curr_url" }).catch(e => console.log("no sidebar")) // used by sidebar
  const { url, title } = tab
  if (url && title) currSrc.set({ url, title })
  console.log({ url, title })
  const source_id = note_mut.localSrcId({ url: url || "", title: title || "" })
  console.log(source_id, get(note_mut.currSrcNId))
}

chrome.tabs.onUpdated.addListener((tabId, info, tab) => {
  // here closes the window
  if (/farosapp\.com\/account/.test(tab.url || ""))
    chrome.sidePanel.setOptions({ enabled: false }).then(() => chrome.sidePanel.setOptions({ enabled: true }))
  updateCurrUrl(tab)
})

chrome.tabs.onActivated.addListener(({ tabId }) => {
  chrome.tabs.get(tabId).then(updateCurrUrl)
})

pendingNotes.stream.subscribe(([note_data, sender]) => {
  const newNote = note_mut.addNote(note_data, get(currSrc))
  console.log("added", newNote)
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

chrome.commands.onCommand.addListener((command) => {
  const api_regexp = RegExp(escapeRegExp(API_ADDRESS))
  if (command == "search" && !api_regexp.test(get(currSrc).url)) {
    chrome.tabs.create({ url: `${API_ADDRESS}/dashboard?search` })
  }
})

if (DEBUG) console.log("loaded all background")
