import { get, set } from "idb-keyval"
let importing = false
chrome.bookmarks.onImportBegan.addListener(() => importing = true)
chrome.bookmarks.onImportEnded.addListener(() => importing = false)

chrome.bookmarks.onCreated.addListener((_id, b) => b.url && !get("dismissed_bookmark_help") && set("dismissed_bookmark_help", true))
chrome.bookmarks.onCreated.addListener((_id, b) =>
// b.url &&
  3,
)

