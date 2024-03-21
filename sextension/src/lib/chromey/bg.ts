import { createClient, type SupportedStorage } from "@supabase/supabase-js"
export type { Session } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const chromeStorageInterface: SupportedStorage = {
  async getItem(key: string): Promise<string | null> {
    const storage = await chrome.storage.local.get(key)
    return storage?.[key]
  },
  async setItem(key: string, value: string): Promise<void> {
    await chrome.storage.local.set({
      [key]: JSON.parse(value),
    })
  },
  async removeItem(key: string): Promise<void> {
    await chrome.storage.local.remove(key)
  },
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  // multiTab: true,
  auth: {
    storage: chromeStorageInterface,
    persistSession: true,
  },
  // localStorage: chromeStorageInterface,
})
