import { DEBUG } from "$lib"

export const currTab = () => chrome.tabs.query({ active: true, currentWindow: true }).then(xs => xs[0])

/** Jump to a note: open its (text-fragment) URL in the current tab. */
export async function gotoNoteUrl(url: string) {
  DEBUG && console.log("going to..", url)
  const tab = await currTab()
  if (tab?.id) chrome.tabs.update(tab.id, { url })
}

export const loc = (s: string) => chrome.i18n.getMessage(s)
export { DEBUG }

export const hasOrGivesPerm = async (perm: chrome.permissions.Permissions) => {
  if (!(await chrome.permissions.contains(perm))) await chrome.permissions.request(perm)
  return await chrome.permissions.contains(perm)
}

export const localize = () => {
  // document.addEventListener("DOMContentLoaded", function () {
  const elements = document.querySelectorAll("[data-i18n]")
  elements.forEach((element) => {
    const messageName = element.getAttribute("data-i18n")
    if (!messageName) return
    const message = chrome.i18n.getMessage(messageName)
    if (message) element.textContent = message
  })
  // })
}

// const handleRuntimeError = () => {
//   const error = chrome.runtime.lastError
//   if (error)
//     throw new Error(error.message)
// }

// export const safeGetTab = async (tabId: number) => {
//   const tab = await chrome.tabs.get(parseInt(tabId))
//   try {
//     handleRuntimeError()
//     return tab
//   } catch (e) {
//     console.log("safeGetTab", e.message)
//   }
//   return {}
// }
