import 'chrome';
const DOMAIN = 'http://78.10.223.2:13723'.replace(/\/$/, ''); // Replace with your domain
// http://78.10.223.2:13723
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

chrome.webNavigation.onCompleted.addListener(() => {
	chrome.runtime.sendMessage({ action: 'update_curr_url' });
});

chrome.tabs.onActivated.addListener(() => {
	chrome.runtime.sendMessage({ action: 'update_curr_url' });
});

const tryn =
	(n, ms = 500) =>
	async (f) => {
		if (n < 1) return;
		try {
			await f();
		} catch {
			await sleep(ms); await tryn(n-1, ms)(f)
		}
	};

async function uploadSelected(request, sender, sendResponse) {
	request.action = 'uploadTextSB';
	const smr = () => chrome.runtime.sendMessage(request);
	tryn(5)(smr)
}
// const { selectedText, html, website_title, website_url, uuid, serialized } = request;
// fetch(`${DOMAIN}/api/upload-snippet`, {
// 	method: 'POST',
// 	headers: { 'Content-Type': 'application/json' },
// 	body: JSON.stringify({
// 		selectedText,
// 		html,
// 		website_title,
// 		website_url,
// 		uuid,
// 		serialized
// 	})
// })
// 	.then((response) => response.json())
// 	.then((data) => console.log(data))
// 	.catch((error) => console.error('Error:', error));

function onMessage(request, sender, sendResponse) {
	if (request.action === 'uploadText') {
		uploadSelected(request, sender, sendResponse);
	} else if (request.action === 'loadDeps') {
		chrome.scripting.executeScript({
			target: { tabId: sender.tab.id },
			files: [
				'rangy/rangy-core.min.js',
				'rangy/rangy-classapplier.min.js',
				'rangy/rangy-highlighter.min.js'
			]
		});
	}
}
chrome.runtime.onMessage.addListener(onMessage);

chrome.runtime.onInstalled.addListener(() => {
	chrome.contextMenus.create({
		id: 'loginStatus',
		title: 'Checking login status...', // Temporary title
		contexts: ['all'],
		documentUrlPatterns: ['<all_urls>']
	});
});

function getUuid() {
	try {
		return crypto.randomUUID();
	} catch {
		console.log('uuid fallback, nonsecure context?');
		return Math.floor(Math.random() * 1_000_000).toString();
	}
}

async function activate(tab) {
	chrome.sidePanel.open({ tabId: tab.id });
	try {
		await chrome.runtime.sendMessage({ action: 'empty' });
	} catch {
		console.log('did not find the thing');
	} // TODO: we may want to skip the text capture - first click open only
	chrome.tabs.sendMessage(tab.id, {
		action: 'getHighlightedText',
		website_title: tab.title,
		website_url: tab.url,
		uuid: getUuid()
	});
}
// this makes it *not close* - it opens from the function above
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false });
chrome.action.onClicked.addListener(activate);

function updateContextMenu(loggedIn) {
	const title = loggedIn ? 'User is logged in' : 'User is not logged in';
	chrome.contextMenus.update('loginStatus', { title: title });
}
// TODO: sort this out
async function onCMclick(info, tab) {
	if (info.menuItemId === 'loginStatus') {
		activate(tab);
	}
}

chrome.contextMenus.onClicked.addListener(onCMclick);

// This function checks the user's login status.
async function checkLoginStatus() {
	try {
		const response = await fetch(`${DOMAIN}/api/check-login`, {
			method: 'GET',
			credentials: 'include' // Important for cookies
		});

		if (response.ok) {
			const data = await response.json();
			if (data.isLoggedIn) {
				// User is logged in
				chrome.contextMenus.update('loginStatus', {
					title: 'User is logged in',
					contexts: ['all']
				});
			} else {
				// User is not logged in
				chrome.contextMenus.update('loginStatus', {
					title: 'User is not logged in - click to log in',
					contexts: ['all']
				});
			}
		} else {
			// Handle http errors
			chrome.contextMenus.update('loginStatus', {
				title: 'Unable to check login status - click to try again',
				contexts: ['all']
			});
		}
	} catch (error) {
		// Handle fetch errors
		chrome.contextMenus.update('loginStatus', {
			title: 'Error: Could not check login status - click to try again',
			contexts: ['all']
		});
		console.error('Error checking login status:', error);
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

// chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
// 	chrome.tabs.sendMessage(tabs[0].id, { action: 'getHighlightedText' });
// });
console.log('loaded all background');
