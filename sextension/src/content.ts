// import 'chrome';
import { prepare2deserialize, reserialize } from "$lib/serialiser/util"
import { makeQCH } from "shared"
import { createTRPCProxyClient } from "@trpc/client"
import { chromeLink } from "trpc-chrome/link"
import type { AppRouter } from "./background"
import { pendingNotes } from "$lib/chromey/messages"
const DEBUG = import.meta.env.VITE_DEBUG || false

if (DEBUG) console.log("hello")

const port = chrome.runtime.connect()
export const T = createTRPCProxyClient<AppRouter>({
  links: [/* 👉 */ chromeLink({ port })],
})
// T.onAdd.subscribe(undefined, {
//   onData(data) {
//     console.log(data)
//   },
// })

if (DEBUG) console.log(T.add.query([1, 77]))

const ran2sel = (rann: Range) => {
  const sel = rangy.getSelection()
  sel.setSingleRange(rann as RangyRange)
  return sel
}

chrome.runtime.sendMessage({ action: "loadDeps" })

const applierOptions = {
  elementProperties: {
    style: { textDecoration: "underline", textDecorationStyle: "dotted" },
    tabIndex: -1,
  },
}
const deleteSelection = (uuid: string) => {
  // let createClassApplier = rangy.createClassApplier;
  const classname = "_" + uuid
  const elements = document.querySelectorAll(`.${classname}`)
  if (DEBUG) console.log("deleting", uuid, elements.length)
  // note this needs to be in sync with applier options above
  elements.forEach((e: any) => (e.style.textDecoration = ""))
}
function wrapSelectedText(uuid: string) {
  const _rangy = rangy as any
  const classname = "_" + uuid
  const app = _rangy.createClassApplier(classname, applierOptions)
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
    const _rangy = rangy as any
    console.log("deserializeing", uuid, serialized)
    const hl = _rangy.createHighlighter()
    const app = _rangy.createClassApplier("_" + uuid, applierOptions)
    hl.addClassApplier(app)
    const prepared = prepare2deserialize(document.body.textContent || "", serialized)
    console.log("prep", prepared)
    try {
      hl.deserialize(prepared)
    } catch {}
  })

const gotoText = (uuid: string) => {
  const elems = document.getElementsByClassName("_" + uuid)
  elems.item(0)!.scrollIntoView({ block: "center" })
  Array.from(elems).forEach((elem: any) => {
    const sc = elem.style.backgroundColor
    elem.style.backgroundColor = "#fff200"
    setTimeout(() => {
      elem.style.backgroundColor = sc
    }, 1000)
  })
}
const htmlstr2body = (h: string) => new DOMParser().parseFromString(h, "text/html").body

// type Req = { action: "getHighlightedText" | "goto" | "deserialize" | "delete" }
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getHighlightedText") {
    const { website_title, website_url, uuid } = request
    const selectedText = window.getSelection()?.toString()
    if (!selectedText) return
    console.log(selectedText, window.getSelection()?.anchorNode?.textContent)
    console.log(rangy.createRange())
    const serialized = wrapSelectedText(uuid)
    console.log(window.getSelection()?.anchorNode)
    gotoText(uuid)

    DEBUG && console.log("uploading...:", { selectedText, website_url })
    // makeQCH grabs text around the highlighted bit:
    // quote: will try to grab the full sentence
    // context: will try to grab like a <p> tag
    // quote is what's displayed on the note
    // context is displayed in the dialog on right click
    const { quote, highlights, context: _context } = makeQCH(htmlstr2body)(document, uuid, selectedText)
    // sometimes context is too much
    const context = _context.length < 1e4 ? _context : quote
    if (!quote) return { note_data: null }
    const note_data = {
      quote,
      highlights,
      context,
      snippet_uuid: uuid,
      serialized_highlight: serialized,
      context_html: "", // I'm thinking whether it makes sense to get it
    }
    pendingNotes.send(note_data)
  }
  if (request.action === "goto") gotoText(request.uuid)
  if (request.action === "deserialize") batchDeserialize(request.uss)
  if (request.action === "delete") deleteSelection(request.uuid)
})
