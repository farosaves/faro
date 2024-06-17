// import { PUBLIC_PI_IP } from '$env/static/public';
import type { SupabaseClient } from "@supabase/supabase-js"
import { API_ADDRESS, DEBUG, funWarn, sbLogger, warnIfError } from "shared"
import { deleteSnippetMsg } from "./chromey/messages"
import type { UUID } from "crypto"
import { flow } from "fp-ts/lib/function"

/**  STRIPS TRAILING '/' */

DEBUG && console.log("API_ADDRESS", API_ADDRESS)

export type ATokens = { access_token: string, refresh_token: string }
export const getSetSession = async (supabase: SupabaseClient, tokens: ATokens) => {
  if (!tokens) {
    // here log me out
    // supabase.auth.signOut({ scope: "local" }).then(logIfError("get session"))
    // await supabase.auth.initialize()
    // const { data: { session } } = await supabase.auth.getSession().then(funLog("getsession with tokens undefined"))
    // return session
    // return
  }
  const { access_token, refresh_token } = tokens
  // set session
  const { data: { session } } = await supabase.auth.setSession({ access_token, refresh_token })
    .then(warnIfError(sbLogger(supabase))("setSession"))
    .catch(flow(funWarn(sbLogger(supabase))("setSessionCatch"), x => ({ data: { session: undefined } })))
  return session
}

export const currTab = () => chrome.tabs.query({ active: true, currentWindow: true }).then(xs => xs[0])

export async function gotoSnippet(uuid: UUID) {
  DEBUG && console.log("going to..", uuid)
  const tab = await currTab()
  deleteSnippetMsg.send(uuid)
  chrome.tabs.sendMessage(tab.id!, { action: "goto", uuid })
}

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
