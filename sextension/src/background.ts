import type { MockNote } from "$lib/utils"
import { option as O } from "fp-ts"
import { initTRPC } from "@trpc/server"
import { observable, type Observer } from "@trpc/server/observable"
import { createChromeHandler } from "trpc-chrome/adapter"
import { z } from "zod"
import { Emitter } from "$lib/emitter"
import { getOrElse } from "shared"
import { pipe } from "fp-ts/lib/function"

const DOMAIN = import.meta.env.VITE_PI_IP.replace(/\/$/, "") // Replace with your domain
const DEBUG = import.meta.env.DEBUG || false

const t = initTRPC.create({
  isServer: false,
  allowOutsideOfServer: true,
})

const addZ = z.tuple([z.number(), z.number()])
type AddZ = z.infer<typeof addZ>

const pushsub = <T>() => {
  const ee = new Emitter<T>()
  const push = (x: T) => ee.emit("bob", x)
  const sub = () => {
    // return an `observable` with a callback which is triggered immediately
    return observable<T>((emit) => {
      const onAdd = emit.next
      // trigger `onAdd()` when `add` is triggered in our event emitter
      ee.on("bob", onAdd)
      // unsubscribe function when client disconnects or stops subscribing
      return () => {
        ee.off("bob", onAdd)
      }
    })
  }
  return [push, sub]
}
const [pushAdd, subAdd] = pushsub()
const appRouter = t.router({
  add: t.procedure.input(addZ).query(({ input }) => {
    pushAdd(input)
    return input[0] + input[1]
  }),
  onAdd: t.procedure.subscription(subAdd),
})

export type AppRouter = typeof appRouter

// @ts-expect-error namespace missing
createChromeHandler({
  router: appRouter,
})

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

chrome.tabs.onUpdated.addListener((tabId, info, tab) => {
  // here
  // closes the window
  if (/farosapp\.com\/account/.test(tab.url || ""))
    chrome.sidePanel.setOptions({ enabled: false }).then(() => chrome.sidePanel.setOptions({ enabled: true }))
  chrome.runtime.sendMessage({ action: "update_curr_url" }).catch((e) => console.log(e))
})

chrome.tabs.onActivated.addListener((info) => {
  chrome.runtime.sendMessage({ action: "update_curr_url" }).catch((e) => console.log(e))
})

const tryn =
  (n: number, ms = 500) =>
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
async function uploadSelected(request: { action: string }, sender: any, sendResponse: any) {
  request.action = "uploadTextSB"
  const smr = () => chrome.runtime.sendMessage(request)
  tryn(5)(smr)
  // const { note_data } = request as {
  // 	action: string
  // 	note_data: MockNote
  //   }
  //   if (note_data) {
  // 	optimistic = O.some(note_data)
  // 	  .use(supa_update(), supabase, note_data)
  // 	  .then((v) => v && T.note2card.mutate({ note_id: v.id }))
  // 	setTimeout(() => (optimistic = O.none), 1000)
  // if you add two within 1 second it will mess it up
  //   }
}

function onMessage(request: { action: any }, sender: chrome.runtime.MessageSender, sendResponse: any) {
  if (request.action === "uploadText") {
    uploadSelected(request, sender, sendResponse)
  } else if (request.action === "loadDeps") {
    chrome.scripting.executeScript({
      target: { tabId: sender?.tab?.id! },
      files: ["rangy/rangy-core.min.js", "rangy/rangy-classapplier.min.js", "rangy/rangy-highlighter.min.js"],
    })
    chrome.runtime.sendMessage({ action: "content_script_loaded" })
  }
}
chrome.runtime.onMessage.addListener(onMessage)

function getUuid() {
  try {
    return crypto.randomUUID()
  } catch {
    console.log("uuid fallback, nonsecure context?")
    // return Math.floor(Math.random() * 1_000_000).toString();
  }
}

async function activate(tab: chrome.tabs.Tab) {
  chrome.sidePanel.open({ tabId: tab.id } as chrome.sidePanel.OpenOptions)
  // try {
  // 	await chrome.runtime.sendMessage({ action: 'empty' });
  // } catch {
  // 	console.log('did not find the thing');
  // } // TODO: we may want to skip the text capture - first click open only
  chrome.tabs
    .sendMessage(tab.id!, {
      action: "getHighlightedText",
      website_title: tab.title,
      website_url: tab.url,
      uuid: getUuid(),
    })
    .catch((e) => console.log(e))
}
// this makes it *not close* - it opens from the function above
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false })
chrome.action.onClicked.addListener(activate)
if (DEBUG) console.log("loaded all background")
