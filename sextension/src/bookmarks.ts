import { get, set } from "idb-keyval"
import { dontTrigger } from "shared"
chrome.bookmarks.onImportBegan.addListener(() => dontTrigger.set(true))
chrome.bookmarks.onImportEnded.addListener(() => dontTrigger.set(false))

chrome.bookmarks.onCreated.addListener((_id, b) => b.url && !get("dismissed_bookmark_help") && set("dismissed_bookmark_help", true))
chrome.bookmarks.onCreated.addListener((_id, b) =>
// b.url &&
  3,
)

