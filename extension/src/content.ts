import { rangyToTextFragment } from "$lib/serialiser/textFragment"
import { DEBUG, funLog, isCmd } from "$lib"
import { createTRPCProxyClient } from "@trpc/client"
import { chromeLink } from "trpc-chrome/link"
import type { AppRouter } from "./background"
import { closeSavePrompt, getHighlightedText, optimisticNotes } from "$lib/chromey/messages"
import type { PendingNote } from "$lib"

if (DEBUG) console.log("hello")

const getT = () => createTRPCProxyClient<AppRouter>({ links: [chromeLink({ port: chrome.runtime.connect() })] })
const T = getT()

/** Page URL with the selection's `#:~:text=` fragment (replacing any existing hash). */
const fragmentUrl = (range: Range) => {
  const u = new URL(window.location.href)
  u.hash = rangyToTextFragment(range)
  return u.href
}

// selection -> text fragment -> newNote. TODO(WS-D): final save flow / newNote signature.
getHighlightedText.sub(async () => {
  const selection = window.getSelection()
  const quote = selection?.toString().replaceAll(/\s+/g, " ").trim()
  if (!selection || !quote || !selection.rangeCount) return
  const note_data: PendingNote = { quote, url: fragmentUrl(selection.getRangeAt(0)) }
  optimisticNotes.send(note_data)
  const newNote = await getT().newNote.mutate(note_data).catch(console.error)
  funLog("newNote")(newNote)
})

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
