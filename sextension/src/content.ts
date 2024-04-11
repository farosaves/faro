// import 'chrome';
import { deserialize, gotoText, reserialize } from "$lib/serialiser/util"
import { API_ADDRESS, DEBUG, elemsOfClass, escapeRegExp, makeQCH } from "shared"
import { createTRPCProxyClient, loggerLink } from "@trpc/client"
import { chromeLink } from "trpc-chrome/link"
import type { AppRouter } from "./background"
import { getHighlightedText, optimisticNotes } from "$lib/chromey/messages"
// import { trpc2 } from "$lib/trpc-client"

if (DEBUG) console.log("hello")

// const Tserver = createTRPCProxyClient({ links: [httpBatchLink({ url: API_ADDRESS + "/trpc" })] }) // trpc({ url: { origin: API_ADDRESS } })
// const Tserver = trpc2()

const port = chrome.runtime.connect()
export const T = createTRPCProxyClient<AppRouter>({
  links: [chromeLink({ port }), loggerLink()],
})

const apiHostname = API_ADDRESS.replace(/http(s?):\/\//, "")
const noteRegexp = RegExp(escapeRegExp(apiHostname) + "/notes/")
const note_idKey = "noteUuid"
;(async () => {
  DEBUG && console.log(window.location.href)
  if (noteRegexp.test(window.location.href || "")) {
    DEBUG && console.log("tested")
    const note_id = (/(?<=\/notes\/).+/.exec(window.location.href) || [])[0]!
    DEBUG && console.log(note_id)
    const { data } = await T.singleNote.query(note_id)
    const newUrlStr = data?.sources?.url
    DEBUG && console.log(newUrlStr)
    if (newUrlStr) {
      const newUrl = new URL(newUrlStr)
      newUrl.searchParams.set(note_idKey, note_id)
      window.location.replace(newUrl)
    }
  }
})()


const ran2sel = (rann: Range) => {
  const sel = rangy.getSelection()
  sel.setSingleRange(rann as RangyRange)
  return sel
}

const applierOptions = {
  elementProperties: {
    style: { textDecoration: "underline", textDecorationStyle: "dotted" },
    tabIndex: -1,
  },
}
const deleteSelection = (uuid: string) => {
  const elements = elemsOfClass("_" + uuid)
  if (DEBUG) console.log("deleting", uuid, elements.length)
  elements.forEach(e => (e.style.textDecoration = ""))
}
function wrapSelectedText(uuid: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const _rangy = rangy as any
  const classname = "_" + uuid
  const app = _rangy.createClassApplier(classname, applierOptions)
  // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
  const ran = document.getSelection()?.getRangeAt(0)!
  const rangeText = reserialize(ran)
  const selection = ran2sel(ran)

  const hl = _rangy.createHighlighter()
  hl.addClassApplier(app)
  hl.highlightSelection(classname, { selection })
  return hl.serialize(selection) + rangeText
}

const batchDeserialize = (uss: [string, string][]) => uss.forEach(deserialize(applierOptions))

const htmlstr2body = (h: string) => new DOMParser().parseFromString(h, "text/html").body

// type Req = { action: "getHighlightedText" | "goto" | "deserialize" | "delete" }
getHighlightedText.sub(async ([uuid]) => {
  const selectedText = window.getSelection()?.toString()
  if (!selectedText) return
  DEBUG && console.log(selectedText, window.getSelection()?.anchorNode?.textContent)
  DEBUG && console.log(rangy.createRange())
  const serialized = wrapSelectedText(uuid)
  DEBUG && console.log(window.getSelection()?.anchorNode)
  gotoText(uuid)

  DEBUG && console.log("uploading...:", { selectedText })
  // makeQCH grabs text around the highlighted bit:
  // quote: will try to grab the full sentence
  // context: will try to grab a <p> tag etc - useful for debugging
  // quote is what's displayed on the note
  const { quote, highlights } = makeQCH(htmlstr2body)(document, uuid, selectedText)
  if (!quote) return { note_data: null }
  const note_data = {
    quote,
    highlights,
    context: "",
    snippet_uuid: uuid,
    serialized_highlight: serialized,
  }
  optimisticNotes.send(note_data)
  const newNote = await T.newNote.mutate(note_data) // .catch(funLog("newNote"))
  if (newNote == null) {
    deleteSelection(uuid)
  }
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "goto") gotoText(request.uuid)
  if (request.action === "delete") deleteSelection(request.uuid)
})

; (async () => { // here I can potentially defer loading if page has no highlights - but would delay creating one on click
  await T.loadDeps.query()
  DEBUG && console.log("loaded bg")
})()

// see supabase-sveltekit/src/routes/notes/[note_id]/+server.ts
let loaded = false
const onLoad = async () => {
  if (!loaded) {
    DEBUG && console.log("loaded")
    await T.serializedHighlights.query().then(batchDeserialize)
    const goto = new URLSearchParams(window.location.search).get("highlightUuid")
    if (goto) gotoText(goto)
    DEBUG && console.log("goto", goto)
    loaded = true
    const singleNote_id = new URLSearchParams(window.location.search).get(note_idKey)
    if (!singleNote_id) return
    const { data } = await T.singleNote.query(singleNote_id)
    if (!data) return
    const { serialized_highlight, snippet_uuid } = data
    if (!serialized_highlight || !snippet_uuid) return
    batchDeserialize([[snippet_uuid, serialized_highlight]])
    gotoText(snippet_uuid)
  }
}
window.addEventListener("load", onLoad)

setTimeout(onLoad, 500) // wait half a second
