// import { PUBLIC_PI_IP } from '$env/static/public';
import type { SupabaseClient } from "@supabase/supabase-js"
import { API_ADDRESS, DEBUG, funLog, logIfError } from "shared"
import { deleteSnippetMsg } from "./chromey/messages"
import type { UUID } from "crypto"

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
  const { data: { session } } = await supabase.auth.setSession({ access_token, refresh_token }).then(logIfError("setSession")).catch(funLog("setSessionCatch"))
  return session
}

export async function gotoSnippet(uuid: UUID) {
  console.log("going to..", uuid)
  const tab = (await chrome.tabs.query({ active: true, currentWindow: true }))[0]
  deleteSnippetMsg.send(uuid)
  chrome.tabs.sendMessage(tab.id!, { action: "goto", uuid })
}

export async function deleteSnippet(uuid: UUID, serialized: string) {
  console.log("deleting..", uuid, serialized)
  const tab = (await chrome.tabs.query({ active: true, currentWindow: true }))[0]
  chrome.tabs.sendMessage(tab.id!, { action: "delete", uuid, serialized })
}
export { DEBUG }

