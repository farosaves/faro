import { type SupportedStorage } from "@supabase/supabase-js"
import { API_ADDRESS, type Database } from "shared"
import { createExtensionServiceWorkerAdapter } from "./adapter/extensionServiceWorkerAdapter"
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
export const supabase = createExtensionServiceWorkerAdapter<Database>({ supabaseUrl,
  supabaseKey: supabaseAnonKey,
  websiteUrl: API_ADDRESS,
})

// export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
//   auth: {
//     storage: chromeStorageInterface,
//     persistSession: true,
//     autoRefreshToken: false,
//     detectSessionInUrl: false,
//   },
// })

