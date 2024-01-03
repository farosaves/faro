chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "uploadText") {
    fetch("https://flashcardize.com/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: request.text }),
    })
      .then((response) => response.json())
      .then((data) => console.log(data))
      .catch((error) => console.error("Error:", error));
  }
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "loginStatus",
    title: "Checking login status...", // Temporary title
    contexts: ["all"],
    documentUrlPatterns: ["<all_urls>"],
  });
});

function updateContextMenu(loggedIn) {
  const title = loggedIn ? "User is logged in" : "User is not logged in";
  chrome.contextMenus.update("loginStatus", { title: title });
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "loginStatus") {
    // Perform action, e.g., open a login page
    chrome.sidePanel.open(
        {tabId: tab.id}
        )      
  }
});

// This function checks the user's login status.
async function checkLoginStatus() {
  const DOMAIN = "http://localhost:5173"; // Replace with your domain

  try {
    const response = await fetch(`${DOMAIN}/api/check-login`, {
      method: "GET",
      credentials: "include", // Important for cookies
    });

    if (response.ok) {
      const data = await response.json();
      if (data.isLoggedIn) {
        // User is logged in
        chrome.contextMenus.update("loginStatus", {
          title: "User is logged in",
          contexts: ["all"],
        });
      } else {
        // User is not logged in
        chrome.contextMenus.update("loginStatus", {
          title: "User is not logged in - click to log in",
          contexts: ["all"],
        });
      }
    } else {
      // Handle http errors
      chrome.contextMenus.update("loginStatus", {
        title: "Unable to check login status - click to try again",
        contexts: ["all"],
      });
    }
  } catch (error) {
    // Handle fetch errors
    chrome.contextMenus.update("loginStatus", {
      title: "Error: Could not check login status - click to try again",
      contexts: ["all"],
    });
    console.error("Error checking login status:", error);
  }
}

// Polling function that checks the login status at a regular interval.
function startPollingLoginStatus(interval) {
  // Immediately check login status when the polling starts.
  checkLoginStatus();

  // Continue to check login status at the specified interval.
  setInterval(checkLoginStatus, interval);
}

// Start polling for login status every 10 minutes.
startPollingLoginStatus(10 * 60 * 1000);

const GOOGLE_ORIGIN = "https://www.google.com";

// chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
//   if (!tab.url) return;
//   const url = new URL(tab.url);
//   // Enables the side panel on google.com
//   if (url.origin === GOOGLE_ORIGIN) {
//     await chrome.sidePanel.setOptions({
//       tabId,
//       path: "sidepanel.html",
//       enabled: true,
//     });
//   } else {
//     // Disables the side panel on all other sites
//     await chrome.sidePanel.setOptions({
//       tabId,
//       enabled: false,
//     });
//   }
// });

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  chrome.tabs.sendMessage(tabs[0].id, { action: "getHighlightedText" });
});
