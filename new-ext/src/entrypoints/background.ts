import { option as O, array as A } from "fp-ts"
import { derived, get, writable } from "svelte/store"
import { flow } from "fp-ts/lib/function"
import type { Session } from "@supabase/supabase-js"

export default defineBackground(() => {
  console.log("Hello background!", { id: browser.runtime.id })

  const currWindowId = writable(-1)
  const wantsNoPrompt = writable(false) // TODO: Replace with proper persistence
  const needsRefresh = writable(false)

  // Basic store setup
  const sess = writable<O.Option<Session>>(O.none)
  const user_id = derived(sess, O.map(s => s.user.id))
  const email = derived(sess, s => O.toNullable(s)?.user?.email)

  // Panel tracking
  interface SavedNote {
    snippet_uuid: string
    serialized_highlight: string
    tags: string[]
  }
  const panels = writable<Map<number, SavedNote[]>>(new Map())
  const notesCurrWindow = derived([currWindowId, panels], ([id, panels]) =>
    panels.get(id)?.length || 0,
  )

  // Basic functions
  const updateCurrUrl = (tab: chrome.tabs.Tab) => {
    const { url, title: _title } = tab
    const title = _title?.replace(/^\s*\(\s*[0-9]+\s*\)\s*/, "").replaceAll(/\s/gi, " ")

    currWindowId.set(tab.windowId)
    // TODO: Add more functionality as we migrate
  }

  const tabQueryUpdate = () =>
    chrome.tabs.query({ active: true, lastFocusedWindow: true })
      .then(flow(A.lookup(0), O.map(updateCurrUrl)))

  async function activate(tab: chrome.tabs.Tab) {
    if (!tab.id) return
    await chrome.sidePanel.open({ tabId: tab.id })
    updateCurrUrl(tab)
    // TODO: Add highlighted text functionality
  }

  // Icon update functionality
  const setIcon = async (n: number, _tabId?: number) => {
    const tabId = _tabId || (await chrome.tabs.query({ active: true, lastFocusedWindow: true })).at(0)?.id
    if (!tabId) return

    return await chrome.action.setIcon({
      path: chrome.runtime.getURL(
        n > 0 ? `icons/n_saved/icon${Math.min(n, 9)}.png` : "icons/icon48.png",
      ),
      tabId: tabId,
    }).catch(console.log)
  }

  notesCurrWindow.subscribe(setIcon)
  chrome.tabs.onUpdated.addListener((tabId, _info, _tab) => setIcon(get(notesCurrWindow), tabId))

  // Event Listeners
  chrome.tabs.onUpdated.addListener(async (tabId, info, _tab) => {
    const tab = await chrome.tabs.query({ active: true, lastFocusedWindow: true }).then(tabs => tabs[0])
    if (!tab) return
    updateCurrUrl(tab)
  })

  chrome.tabs.onActivated.addListener(async ({ tabId }) => {
    const tab = await chrome.tabs.query({ active: true, lastFocusedWindow: true }).then(tabs => tabs[0])
    if (!tab) return
    updateCurrUrl(tab)
  })

  // Context menu setup
  chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: "save",
      title: "Faro save",
      contexts: ["all"],
      documentUrlPatterns: ["<all_urls>"],
    })
  })

  chrome.contextMenus.onClicked.addListener((info, tab) =>
    info.menuItemId == "save" && tab && activate(tab))

  // Action click handler
  chrome.action.setPopup({ popup: "" }) // Ensure no popup is set
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
  chrome.action.onClicked.addListener(activate)

  // Install/Uninstall handlers
  chrome.runtime.onInstalled.addListener((e) => {
    if (e.reason === chrome.runtime.OnInstalledReason.INSTALL) {
      // TODO: Add welcome page URL
      // chrome.tabs.create({ url: API_ADDRESS + "/welcome" })
    }
  })
  // TODO: Add uninstall URL
  // chrome.runtime.setUninstallURL(API_ADDRESS + "/farewell")

  // Error handling
  self.addEventListener("error", (event) => {
    console.error("Unhandled error:", event.message, "at", event.filename, "line", event.lineno, "column", event.colno)
  })

  self.addEventListener("unhandledrejection", (event) => {
    console.warn("Unhandled rejection:", event.reason)
  })
})
