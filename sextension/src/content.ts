// import 'chrome';
import { deserialize, gotoText, reserialize } from "$lib/serialiser/util"
import { DEBUG, elemsOfClass, funLog, isCmd, note_idKey, Semaphore, sleep, uuidRegex } from "shared"
import { createTRPCProxyClient } from "@trpc/client"
import { chromeLink } from "trpc-chrome/link"
import { array as A, string as S } from "fp-ts"
import type { AppRouter } from "./background"
import { closeSavePrompt, getHighlightedText, optimisticNotes } from "$lib/chromey/messages"
import type { UUID } from "crypto"
import { makeQH } from "$lib/makeQH"
// import { trpc2 } from "$lib/trpc-client"

if (DEBUG) console.log("hello")

// const Tserver = createTRPCProxyClient({ links: [httpBatchLink({ url: API_ADDRESS + "/trpc" })] }) // trpc({ url: { origin: API_ADDRESS } })
// const Tserver = trpc2()
const getT = () => createTRPCProxyClient<AppRouter>({ links: [chromeLink({ port: chrome.runtime.connect() })] })
const T = getT()

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
  elements.forEach(e => e.parentNode?.replaceChild(document.createTextNode(e.textContent || ""), e))

  // elements.forEach(e => (e.style.textDecoration = ""))
  // elements.forEach(e => e.classList.remove("_" + uuid))
}
function wrapSelectedText(uuid: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const _rangy = rangy as any
  const classname = "_" + uuid
  const app = _rangy.createClassApplier(classname, applierOptions)
  // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
  const ran = window.getSelection()?.getRangeAt(0)!
  const rangeText = reserialize(ran)
  const selection = ran2sel(ran)

  const hl = _rangy.createHighlighter()
  hl.addClassApplier(app)
  hl.highlightSelection(classname, { selection })
  return hl.serialize(selection) + rangeText
}

const batchDeserialize = (uss: [string, string][]) => uss.map(deserialize(applierOptions))

const htmlstr2body = (h: string) => new DOMParser().parseFromString(h, "text/html").body

// check if it's part of another already
const subSelection = async (selectedText: string, T: ReturnType<typeof createTRPCProxyClient<AppRouter>>) => {
  const anchorClasses = Array.from(window.getSelection()?.anchorNode?.parentElement?.classList || [])
  const potentialHighlights = anchorClasses.filter(s => s.startsWith("_")).map(s => s.slice(1)).filter(x => uuidRegex.test(x))
  if (potentialHighlights.length) {
    const ids = (await T.serializedHighlights.query()).map(([s, _serialized]) => s as UUID)
    const int = A.intersection(S.Eq)(ids)(potentialHighlights)
    if (int.length) {
      if (int.length > 1) console.log("what the heck?")
      T.singleNoteBySnippetId.query(int[0])
      const note = await T.singleNoteBySnippetId.query(int[0])
      if (note?.quote.includes(selectedText)) {
        note?.highlights.push(selectedText)
        DEBUG && console.log("updated note", JSON.stringify(note))
        if (note) T.updateNote.mutate(note).catch(console.error)
        return true
      }
    }
  }
  return false
}

getHighlightedText.sub(async ([uuid]) => {
  // for testing I could wrap this in a function and tryna invoke it from playwright
  const selectedText = window.getSelection()?.toString()
  if (!selectedText) return
  // now check if we're in a quote already
  const T = getT()
  if (await subSelection(selectedText, T)) return
  DEBUG && console.log(selectedText, window.getSelection()?.anchorNode?.textContent)
  DEBUG && console.log(rangy.createRange())
  const serialized = wrapSelectedText(uuid)
  DEBUG && console.log(window.getSelection()?.anchorNode)
  gotoText(uuid)

  DEBUG && console.log("uploading...:", { selectedText })
  // makeQH grabs text around the selected bit:
  // if it's <=3 words they're highlighted and surrounding sentence is a quote
  // if it's > 3 words the selection is the quote and nothing is highlighted
  const { quote, highlights } = makeQH(document, uuid, selectedText)
  if (!quote) return { note_data: null }
  const note_data = {
    quote,
    highlights,
    snippet_uuid: uuid,
    serialized_highlight: serialized,
    url: window.location.href,
  }
  optimisticNotes.send(note_data)
  const newNote = await T.newNote.mutate(note_data).catch(console.error) // does this solve trpc using disconnected port?
  funLog("newNote")(newNote)
  if (!newNote) {
    deleteSelection(uuid)
    return
  }
  newNote
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "goto") gotoText(request.uuid)
  if (request.action === "delete") deleteSelection(request.uuid)
})

const sem = new Semaphore()

sem.use(async () => { // here I can potentially defer loading if page has no highlights - but would delay creating one on click
  await T.loadDeps.query()
  await sleep(50)
  DEBUG && console.log("loaded bg")
})

// see supabase-sveltekit/src/routes/notes/[note_id]/+server.ts
let loaded = false
let toDeserialise: [string, string][] = []
let wentTo = false
let wentToNote = false
const onLoad = () => sem.use(async () => {
  document.getElementById("farogetitlink")?.classList.add("hidden")
  if (loaded && !toDeserialise.length) return // ! I don't know what's really going on here.
  // I can look here on bg side to see if after naviagtion there's been no query for some time - meaning no content script.
  if (!loaded) toDeserialise = await T.serializedHighlights.query()
  loaded = true
  DEBUG && console.log("sers", toDeserialise)
  batchDeserialize(toDeserialise)
  // const successes = toDeserialise.map(x => document.getElementsByClassName("_" + x[0]).length)
  // funLog("successes")(successes)
  // toDeserialise = pipe(toDeserialise, // keep unsuccessful
  //   A.zip(successes), A.filter(([_, success]) => !success), A.map(([x, _y]) => x))
  const goto = window.location.hash.charAt(1) == "_" ? window.location.hash.slice(2) : undefined
  await sleep(50)
  DEBUG && console.log("goto", goto, window.location.hash)
  try {
    if (!wentTo && goto) gotoText(goto)
    wentTo = true
  } catch { 3 }

  const singleNote_id = new URLSearchParams(window.location.search).get(note_idKey)
  if (!singleNote_id) return
  const { data: note } = await T.singleNote.query(singleNote_id)
  if (!note) return
  // bind the note to uhh tabId until src changes?
  const { serialized_highlight, snippet_uuid } = note
  if (!serialized_highlight || !snippet_uuid) return
  batchDeserialize([[snippet_uuid, serialized_highlight]])
  if (!wentToNote && snippet_uuid) {
    gotoText(snippet_uuid)
    wentToNote = true
  }
})
window.addEventListener("load", onLoad)
window.addEventListener("DOMContentLoaded", onLoad)
// window.addEventListener("focus", onLoad) doesnt fix this

setTimeout(onLoad, 500) // wait half a second
setTimeout(onLoad, 1000) // wait half a second
setTimeout(onLoad, 2000) // wait a second
setTimeout(onLoad, 5000) // wait 3 second
setTimeout(onLoad, 10000) // wait 5 second again
setTimeout(onLoad, 15000) // wait 5 second again

let promptOpen = false
window.addEventListener("keydown", async (e) => {
  if (e.altKey && e.code == "KeyC") T.openDashboard.query()
  if (isCmd(e) && e.code == "KeyD") {
    if (promptOpen || await T.requestedNoPrompt.query()) return
    promptOpen = true
    const src = chrome.runtime.getURL("prompt.html")
    const iframe = new DOMParser().parseFromString(
      `<iframe src="${src}" style="width: 100%;
      height: 6rem;
      position: sticky;
      top: 0;
      z-index: 999;"
      ></iframe>`, "text/html",
    ).body.firstElementChild as HTMLElement | null
    if (!iframe) return
    iframe && document.body.prepend(iframe)
    await closeSavePrompt.wait()
    iframe.style.display = "none"
    promptOpen = false
  }
})

