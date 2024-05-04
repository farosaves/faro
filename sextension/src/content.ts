// import 'chrome';
import { deserialize, gotoText, reserialize } from "$lib/serialiser/util"
import { API_ADDRESS, DEBUG, elemsOfClass, escapeRegExp, funLog, makeQH, note_idKey, Semaphore, sleep } from "shared"
import { createTRPCProxyClient } from "@trpc/client"
import { chromeLink } from "trpc-chrome/link"
import { array as A, string as S } from "fp-ts"
import type { AppRouter } from "./background"
import { checkGoto, getHighlightedText, gotoNoSuccess, optimisticNotes } from "$lib/chromey/messages"
import type { UUID } from "crypto"
// import { trpc2 } from "$lib/trpc-client"

if (DEBUG) console.log("hello")

// const Tserver = createTRPCProxyClient({ links: [httpBatchLink({ url: API_ADDRESS + "/trpc" })] }) // trpc({ url: { origin: API_ADDRESS } })
// const Tserver = trpc2()

const port = chrome.runtime.connect()
export const T = createTRPCProxyClient<AppRouter>({
  links: [chromeLink({ port })],
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
  elements.forEach(e => e.classList.remove("_" + uuid))
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

const batchDeserialize = (uss: [string, string][]) => uss.forEach(deserialize(applierOptions))

const htmlstr2body = (h: string) => new DOMParser().parseFromString(h, "text/html").body

// check if it's part of another already
const subSelection = async (selectedText: string) => {
  const anchorClasses = Array.from(window.getSelection()?.anchorNode?.parentElement?.classList || [])
  const potentialHighlights = anchorClasses.filter(s => s.startsWith("_")).map(s => s.slice(1))
  if (potentialHighlights.length) {
    const ids = (await T.serializedHighlights.query()).map(([s, _serialized]) => s as UUID)
    const int = A.intersection(S.Eq)(ids)(potentialHighlights)
    if (int) {
      if (int.length > 1) console.log("what the heck?")
      T.singleNoteBySnippetId.query(int[0])
      const note = await T.singleNoteBySnippetId.query(int[0])
      if (note?.quote.includes(selectedText)) {
        note?.highlights.push(selectedText)
        console.log("updated note", JSON.stringify(note))
        if (note) T.updateNote.mutate(note)
        return true
      }
    }
  }
  return false
}

getHighlightedText.sub(async ([uuid]) => {
  const selectedText = window.getSelection()?.toString()
  if (!selectedText) return
  // now check if we're in a quote already
  if (await subSelection(selectedText)) return


  DEBUG && console.log(selectedText, window.getSelection()?.anchorNode?.textContent)
  DEBUG && console.log(rangy.createRange())
  const serialized = wrapSelectedText(uuid)
  DEBUG && console.log(window.getSelection()?.anchorNode)
  gotoText(uuid)

  DEBUG && console.log("uploading...:", { selectedText })
  // makeQH grabs text around the selected bit:
  // if it's <=3 words they're highlighted and surrounding sentence is a quote
  // if it's > 3 words the selection is the quote and nothing is highlighted
  const { quote, highlights } = makeQH(htmlstr2body)(document, uuid, selectedText)
  if (!quote) return { note_data: null }
  const note_data = {
    quote,
    highlights,
    context: "",
    snippet_uuid: uuid,
    serialized_highlight: serialized,
    url: window.location.href,
  }
  optimisticNotes.send(note_data)
  const newNote = await T.newNote.mutate(note_data) // .catch(funLog("newNote"))
  funLog("newNote")(newNote)
  if (newNote == null) {
    deleteSelection(uuid)
  }
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
let failedOnce = false
const onLoad = () => sem.use(async () => {
  if (!loaded) {
    if (await testIfLinkTest()) return // use non-ext flow 4 highlight obv

    const sers = await T.serializedHighlights.query()
    DEBUG && console.log("sers", sers)
    batchDeserialize(sers)
    const goto = new URLSearchParams(window.location.search).get("highlightUuid")
    await sleep(50)
    DEBUG && console.log("goto", goto)
    try {
      if (goto) gotoText(goto)
      loaded = true
    } catch { failedOnce = true }

    const singleNote_id = new URLSearchParams(window.location.search).get(note_idKey)
    if (!singleNote_id) return
    const { data } = await T.singleNote.query(singleNote_id)
    if (!data) return
    const { serialized_highlight, snippet_uuid } = data
    if (!serialized_highlight || !snippet_uuid) return
    batchDeserialize([[snippet_uuid, serialized_highlight]])
    gotoText(snippet_uuid)
  }
})
window.addEventListener("load", onLoad)
window.addEventListener("DOMContentLoaded", onLoad)

setTimeout(onLoad, 500) // wait half a second

const testIfLinkTest = async () => {
  const noteTestRegexp = RegExp(escapeRegExp(API_ADDRESS.replace(/http(s?):\/\//, "")) + "/notes/test/")
  const url = window.location.href
  funLog("testIfLinkTest")(url)
  const note_ids = (url && noteTestRegexp.test(url))
    && ((/(?<=\/notes\/test\/).+/.exec(url)))
  funLog("testIfLinkTest ids")(note_ids)
  if (!note_ids) return false
  const note = await T.singleNoteLocal.query(note_ids[0])
  if (!note) return console.log("copied note not present locally?") // override debug for now
  const e = document.getElementsByClassName("_" + note.snippet_uuid)
  funLog("testIfLinkTest elems")(e)
  if (e.length) await T.closeMe.query()
  if (e.length) return // superfluous
  T.move2Prompt.query(note.id)
}

checkGoto.sub(() => gotoNoSuccess.send(!loaded && failedOnce))

window.addEventListener("keydown", async e => e.altKey && e.code == "KeyF" && T.openDashboard.query())
