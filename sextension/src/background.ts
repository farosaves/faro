import { API_ADDRESS, getSession } from "$lib/utils"
import { option as O } from "fp-ts"
import { initTRPC } from "@trpc/server"
import { createChromeHandler } from "trpc-chrome/adapter"
import { z } from "zod"
import { pushStore, pendingNotes } from "$lib/chromey/messages"
import { derived, get, writable } from "svelte/store"
import { NoteSync, domain_title, escapeRegExp, hostname, type PendingNote } from "shared"
import { trpc2 } from "$lib/trpc-client"
import { loadSB } from "$lib/loadSB"
import type { Session, SupportedStorage } from "@supabase/supabase-js"
import { supabase } from "$lib/chromey/bg"
import { NoteMut } from "$lib/note_mut"

const DOMAIN = import.meta.env.VITE_PI_IP.replace(/\/$/, "")
const DEBUG = import.meta.env.DEBUG || false

const T = trpc2()

const note_sync: NoteSync = new NoteSync(supabase, undefined)
const note_mut: NoteMut = new NoteMut(note_sync)
const sess = writable<O.Option<Session>>(O.none)
const user_id = derived(sess, O.map(s => s.user.id))
// on user/session run:
const onUser_idUpdate = O.map((user_id: string) => {
  note_sync.setUid(user_id)
  note_sync.refresh_sources()
  note_sync.refresh_notes()
})
user_id.subscribe(onUser_idUpdate)

const refresh = async () => {
  const toks = await T.my_tokens.query() // .then((x) => console.log("bg tokens", x))
  const newSess = O.fromNullable(await getSession(supabase, toks))
  sess.update(n => O.orElse(newSess, () => n))
}
refresh()

const t = initTRPC.create({
  isServer: false,
  allowOutsideOfServer: true,
})

const addZ = z.tuple([z.number(), z.number()])
type AddZ = z.infer<typeof addZ>
const appRouter = t.router({
  add: t.procedure.input(addZ).query(({ input }) => input[0] + input[1]),
})
export type AppRouter = typeof appRouter

// @ts-expect-error namespace missings
createChromeHandler({
  router: appRouter,
})

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

const currUrl = writable("")
pushStore("currSrcMutBg", note_mut.curr_source)

const updateCurrUrl = (tab: chrome.tabs.Tab) => {
  chrome.runtime.sendMessage({ action: "update_curr_url" }).catch(e => console.log(e)) // used by sidebar
  const { url, title } = tab
  if (url) currUrl.set(url)
  console.log({ url, title })
  let source_id = note_mut.localSrcId({ url: url || "", title: title || "" })
  console.log(source_id, get(note_mut.curr_source))
  // O.map(currDomainTitle.set)(domain_title(tab.url || "", tab.title || ""))
  // console.log(get(currDomainTitle))
}
chrome.tabs.onUpdated.addListener((tabId, info, tab) => {
  // here closes the window
  if (/farosapp\.com\/account/.test(tab.url || ""))
    chrome.sidePanel.setOptions({ enabled: false }).then(() => chrome.sidePanel.setOptions({ enabled: true }))
  updateCurrUrl(tab)
})

chrome.tabs.onActivated.addListener(({ tabId }) => {
  chrome.runtime.sendMessage({ action: "update_curr_url" }).catch(e => console.log(e))
  chrome.tabs.get(tabId).then(updateCurrUrl)
})

const tryn
  = (n: number, ms = 500) =>
    async (f: any) => {
      // TODO
      if (n < 1) return
      try {
        await f()
      } catch {
        await sleep(ms)
        await tryn(n - 1, ms)(f)
      }
    }

// to sidepanel

pendingNotes.stream.subscribe(([note_data, sender]) => {
  const smr = () => chrome.runtime.sendMessage({ action: "uploadTextSB", note_data })
  tryn(5, 1000)(smr)
})

function onMessage(request: { action: any }, sender: chrome.runtime.MessageSender, sendResponse: any) {
  if (request.action === "loadDeps") {
    chrome.scripting.executeScript({
      target: { tabId: sender?.tab?.id! },
      files: ["rangy/rangy-core.min.js", "rangy/rangy-classapplier.min.js", "rangy/rangy-highlighter.min.js"],
    })
    chrome.runtime.sendMessage({ action: "content_script_loaded" })
  }
}
chrome.runtime.onMessage.addListener(onMessage)

const getUuid = () => crypto.randomUUID()
// try {
//   return
// } catch {
//   console.log("uuid fallback, nonsecure context?")
// }

async function activate(tab: chrome.tabs.Tab) {
  chrome.sidePanel.open({ tabId: tab.id } as chrome.sidePanel.OpenOptions)
  chrome.tabs
    .sendMessage(tab.id!, {
      action: "getHighlightedText",
      website_title: tab.title,
      website_url: tab.url,
      uuid: getUuid(),
    })
    .catch(e => console.log(e))
}
// this makes it *not close* - it opens from the function above
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false })
chrome.action.onClicked.addListener(activate)

chrome.commands.onCommand.addListener((command) => {
  const api_regexp = RegExp(escapeRegExp(API_ADDRESS))
  if (command == "search" && !api_regexp.test(get(currUrl))) {
    chrome.tabs.create({ url: `${API_ADDRESS}/dashboard?search` })
  }
})

if (DEBUG) console.log("loaded all background")
