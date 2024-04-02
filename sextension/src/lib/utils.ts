// import { PUBLIC_PI_IP } from '$env/static/public';
import type { SupabaseClient } from "@supabase/supabase-js"
import { logIfError, type Notes } from "shared"
import { deleteSnippetMsg } from "./chromey/messages"
import type { UUID } from "crypto"

/**  STRIPS TRAILING '/' */
export const API_ADDRESS = import.meta.env.VITE_PI_IP.replace(/\/$/, "") as string
export const DEBUG = import.meta.env.VITE_DEBUG || false

// console.log("API_ADDRESS", API_ADDRESS)

export type ATokens = { access_token: string, refresh_token: string } | undefined
export const getSession = async (supabase: SupabaseClient, tokens: ATokens) => {
  if (!tokens) {
    // here log me out
    supabase.auth.signOut().then(logIfError)
    return null
  }
  const { access_token, refresh_token } = tokens
  // set session
  await supabase.auth.setSession({ access_token, refresh_token }).then(logIfError)

  const {
    data: { session },
  } = await supabase.auth.getSession().then(logIfError)
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
