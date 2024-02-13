const DOMAIN = "http://localhost:5173".replace(/\/$/, "");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
chrome.webNavigation.onCompleted.addListener(() => {
  chrome.runtime.sendMessage({ action: "update_curr_url" });
});
chrome.tabs.onActivated.addListener(() => {
  chrome.runtime.sendMessage({ action: "update_curr_url" });
});
const tryn = (n, ms = 500) => async (f) => {
  if (n < 1)
    return;
  try {
    await f();
  } catch {
    await sleep(ms);
    await tryn(n - 1, ms)(f);
  }
};
async function uploadSelected(request, sender, sendResponse) {
  request.action = "uploadTextSB";
  const smr = () => chrome.runtime.sendMessage(request);
  tryn(5)(smr);
}
function onMessage(request, sender, sendResponse) {
  if (request.action === "uploadText") {
    uploadSelected(request);
  } else if (request.action === "loadDeps") {
    chrome.scripting.executeScript({
      target: { tabId: sender.tab.id },
      files: [
        "rangy/rangy-core.min.js",
        "rangy/rangy-classapplier.min.js",
        "rangy/rangy-highlighter.min.js"
      ]
    });
  }
}
chrome.runtime.onMessage.addListener(onMessage);
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "loginStatus",
    title: "Checking login status...",
    // Temporary title
    contexts: ["all"],
    documentUrlPatterns: ["<all_urls>"]
  });
});
function getUuid() {
  try {
    return crypto.randomUUID();
  } catch {
    console.log("uuid fallback, nonsecure context?");
    return Math.floor(Math.random() * 1e6).toString();
  }
}
async function activate(tab) {
  chrome.sidePanel.open({ tabId: tab.id });
  try {
    await chrome.runtime.sendMessage({ action: "empty" });
  } catch {
    console.log("did not find the thing");
  }
  chrome.tabs.sendMessage(tab.id, {
    action: "getHighlightedText",
    website_title: tab.title,
    website_url: tab.url,
    uuid: getUuid()
  });
}
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false });
chrome.action.onClicked.addListener(activate);
async function onCMclick(info, tab) {
  if (info.menuItemId === "loginStatus") {
    activate(tab);
  }
}
chrome.contextMenus.onClicked.addListener(onCMclick);
async function checkLoginStatus() {
  try {
    const response = await fetch(`${DOMAIN}/api/check-login`, {
      method: "GET",
      credentials: "include"
      // Important for cookies
    });
    if (response.ok) {
      const data = await response.json();
      if (data.isLoggedIn) {
        chrome.contextMenus.update("loginStatus", {
          title: "User is logged in",
          contexts: ["all"]
        });
      } else {
        chrome.contextMenus.update("loginStatus", {
          title: "User is not logged in - click to log in",
          contexts: ["all"]
        });
      }
    } else {
      chrome.contextMenus.update("loginStatus", {
        title: "Unable to check login status - click to try again",
        contexts: ["all"]
      });
    }
  } catch (error) {
    chrome.contextMenus.update("loginStatus", {
      title: "Error: Could not check login status - click to try again",
      contexts: ["all"]
    });
    console.error("Error checking login status:", error);
  }
}
function startPollingLoginStatus(interval) {
  checkLoginStatus();
  setInterval(checkLoginStatus, interval);
}
startPollingLoginStatus(10 * 60 * 1e3);
console.log("loaded all background");
