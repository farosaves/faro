// import { PUBLIC_PI_IP } from '$env/static/public';
import { API_ADDRESS, DEBUG } from "shared"
import { deleteSnippetMsg } from "./chromey/messages"
import type { UUID } from "crypto"

/**  STRIPS TRAILING '/' */

DEBUG && console.log("API_ADDRESS", API_ADDRESS)

export type ATokens = { access_token: string, refresh_token: string }

export const currTab = () => chrome.tabs.query({ active: true, currentWindow: true }).then(xs => xs[0])

export async function gotoSnippet(uuid: UUID) {
  DEBUG && console.log("going to..", uuid)
  const tab = await currTab()
  deleteSnippetMsg.send(uuid)
  chrome.tabs.sendMessage(tab.id!, { action: "goto", uuid })
}

export const loc = (s: string) => chrome.i18n.getMessage(s)
export async function deleteSnippet(uuid: UUID, serialized: string) {
  DEBUG && console.log("deleting..", uuid, serialized)
  const tab = await currTab()
  chrome.tabs.sendMessage(tab.id!, { action: "delete", uuid, serialized })
}
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
