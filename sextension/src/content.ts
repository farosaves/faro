// import 'chrome';
import { prepare2deserialize, reserialize } from "$lib/serialiser/util"
import { elemsOfClass, funLog, logIfError, makeQCH, sleep } from "shared"
import { createTRPCProxyClient, loggerLink } from "@trpc/client"
import { chromeLink } from "trpc-chrome/link"
import type { AppRouter } from "./background"
import { getHighlightedText, optimisticNotes } from "$lib/chromey/messages"
import { DEBUG } from "$lib/utils"

if (DEBUG) console.log("hello")

const port = chrome.runtime.connect()
export const T = createTRPCProxyClient<AppRouter>({
  links: [chromeLink({ port }), loggerLink()],
})

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

const batchDeserialize = (uss: [string, string][]) =>
  uss.forEach(([uuid, serialized]) => {
    if (!serialized) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const _rangy = rangy as any
    console.log("deserializeing", uuid, serialized)
    const hl = _rangy.createHighlighter()
    const app = _rangy.createClassApplier("_" + uuid, applierOptions)
    hl.addClassApplier(app)
    const prepared = prepare2deserialize(document.body.textContent || "", serialized)
    console.log("prep", prepared)
    try {
      hl.deserialize(prepared)
    } catch { return }
  })

const gotoText = (uuid: string) => {
  const elems = elemsOfClass("_" + uuid)
  elems.item(0)!.scrollIntoView({ block: "center" })
  elems.forEach((elem) => {
    const sc = elem.style.backgroundColor
    elem.style.backgroundColor = "#fff200"
    setTimeout(() => {
      elem.style.backgroundColor = sc
    }, 1000)
  })
}
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

; (async () => { // here I can potentially skip loading if page has no highlights
  await T.loadDeps.query()
  console.log("loaded bg")
  sleep(100)
  await T.serializedHighlights.query().then(batchDeserialize)
  const goto = new URLSearchParams(window.location.search).get("highlightUuid")
  if (goto) gotoText(goto)
  console.log("goto", goto)
})()
