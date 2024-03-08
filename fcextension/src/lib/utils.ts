/**
 * a little helper that is written for convenience so that instead
 * of calling `const { data: { session } } = await supabase.auth.getSession()`
 * you just call this `await getSession()`
 */
// import { PUBLIC_PI_IP } from '$env/static/public';
import type { SupabaseClient } from "@supabase/supabase-js"
import { logIfError } from "./shared/utils"

export let API_ADDRESS = import.meta.env.VITE_PI_IP.replace(/\/$/, "")

// console.log("API_ADDRESS", API_ADDRESS)

export type ATokens = { access_token: string; refresh_token: string } | undefined
export let getSession = async (supabase: SupabaseClient, tokens: ATokens) => {
  if (!tokens) return
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

export async function getNotes(supabase: SupabaseClient, source_id: number, user_id: string) {
  const { data, error } = await supabase
    .from("notes")
    .select()
    .eq("source_id", source_id)
    .eq("user_id", user_id)
    .order("created_at")
  error && console.log("getNotes error", error)
  console.log(data)
  return data ?? null
}

export type MockNote = {
  quote: string
  source_id: number
  highlights: string[]
  context: string
  snippet_uuid: string
  serialized_highlight: string
  sources: { title: string; url: string }
}

export const mock = {
  id: -1,
  predicted_topic: "",
  created_at: "",
  tags: [],
  user_id: "",
  user_note: "",
}
