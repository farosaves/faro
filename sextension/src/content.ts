// import 'chrome';
// import { makeQCH } from "../ lib/shared/snippetiser/main";
import { prepare2deserialize, reserialize } from "$lib/serialiser/util"
import { makeQCH } from "shared"
const DEBUG = import.meta.env.VITE_DEBUG || false

if (DEBUG) console.log("hello")

const ran2sel = (rann: Range) => {
  let sel = rangy.getSelection()
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
const deleteSelection = (uuid, serialized) => {
  // let createClassApplier = rangy.createClassApplier;
  const classname = "_" + uuid
  const elements = document.querySelectorAll(`.${classname}`)
  if (DEBUG) console.log("deleting", uuid, elements.length)
  // note this needs to be in sync with applier options above
  elements.forEach((e) => (e.style.textDecoration = ""))
}
function wrapSelectedText(uuid) {
  let createClassApplier = rangy.createClassApplier
  let createHighlighter = rangy.createHighlighter
  const classname = "_" + uuid
  const app = createClassApplier(classname, applierOptions)
  const ran = document.getSelection()?.getRangeAt(0)!
  const rangeText = reserialize(ran)
  const selection = ran2sel(ran)

  const hl = createHighlighter()
  hl.addClassApplier(app)
  hl.highlightSelection(classname, { selection })
  return hl.serialize(selection) + rangeText
}

let batchDeserialize = (uss) =>
  uss.forEach(([uuid, serialized]) => {
    if (!serialized) return
    let createClassApplier = rangy.createClassApplier
    let createHighlighter = rangy.createHighlighter
    console.log("deserializeing", uuid, serialized)
    const hl = createHighlighter()
    const app = createClassApplier("_" + uuid, applierOptions)
    hl.addClassApplier(app)
    const prepared = prepare2deserialize(document.body.textContent || "", serialized)
    console.log("prep", prepared)
    hl.deserialize(prepared)
  })

let gotoText = (uuid) => {
  const elems = document.getElementsByClassName("_" + uuid)
  elems.item(0)!.scrollIntoView({ block: "center" })
  Array.from(elems).forEach((elem) => {
    const sc = elem.style.backgroundColor
    elem.style.backgroundColor = "#fff200"
    setTimeout(() => {
      elem.style.backgroundColor = sc
    }, 1000)
  })
}

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

    console.log("uploading...:", { selectedText, website_url })
    // makeQCH grabs text around the highlighted bit:
    // quote: will try to grab the full sentence
    // context: will try to grab like a <p> tag
    // quote is what's displayed on the note
    // context is displayed in the dialog on right click
    const { quote, highlights, context: _context } = makeQCH(document, uuid, selectedText)
    // sometimes context is too much
    const context = _context.length < 1e4 ? _context : quote
    if (!quote) return { note_data: null }
    const note_data = {
      quote,
      source_id: -1,
      highlights,
      context,
      snippet_uuid: uuid,
      serialized_highlight: serialized,
      sources: { title: website_title, url: website_url },
    }
    // supa_update(locals.supabase, note_data).then(console.log);
    // return { note_data };
    // }),

    chrome.runtime.sendMessage({
      action: "uploadText",
      note_data,
    })
  }
  if (request.action === "goto") gotoText(request.uuid)
  if (request.action === "deserialize") batchDeserialize(request.uss)
  if (request.action === "delete") deleteSelection(request.uuid, request.serialized)
})

function sendHighlightedText() {
  const text = window.getSelection().toString()
  if (text) {
    chrome.runtime.sendMessage({ text: text })
  } else {
    chrome.runtime.sendMessage({ error: "No text selected." })
  }
}
