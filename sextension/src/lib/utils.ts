/**
 * a little helper that is written for convenience so that instead
 * of calling `const { data: { session } } = await supabase.auth.getSession()`
 * you just call this `await getSession()`
 */
// import { PUBLIC_PI_IP } from '$env/static/public';
import type { SupabaseClient } from "@supabase/supabase-js"
import { logIfError, type Notes } from "shared"

export const API_ADDRESS = import.meta.env.VITE_PI_IP.replace(/\/$/, "")

// console.log("API_ADDRESS", API_ADDRESS)

export type ATokens = { access_token: string; refresh_token: string } | undefined
export const getSession = async (supabase: SupabaseClient, tokens: ATokens) => {
  if (!tokens) return null
  const { access_token, refresh_token } = tokens
  // set session
  await supabase.auth.setSession({ access_token, refresh_token }).then(logIfError)

  const {
    data: { session },
  } = await supabase.auth.getSession().then(logIfError)
  return session
}

export async function gotoSnippet(uuid: string) {
  console.log("going to..", uuid)
  const tab = (await chrome.tabs.query({ active: true, currentWindow: true }))[0]
  chrome.tabs.sendMessage(tab.id!, { action: "goto", uuid })
}

export async function deleteSnippet(uuid: string, serialized: string) {
  console.log("deleting..", uuid, serialized)
  const tab = (await chrome.tabs.query({ active: true, currentWindow: true }))[0]
  chrome.tabs.sendMessage(tab.id!, { action: "delete", uuid, serialized })
}

export type PendingNote = Omit<Notes, keyof ReturnType<typeof createMock>>

let currentId = 0
export const createMock = () => ({
  id: (currentId -= 1),
  source_id: -1,
  predicted_topic: "",
  created_at: "",
  tags: [],
  user_id: "",
  user_note: "",
  context_html: "",
})
