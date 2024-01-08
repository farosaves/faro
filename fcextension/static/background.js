import 'chrome';

function uploadSelected(request, sender, sendResponse) {
	const DOMAIN = 'http://localhost:5173'; // Replace with your domain
	if (request.action === 'uploadText') {
		const { selectedText, contextText } = request;
		fetch(`${DOMAIN}/api/upload`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ selectedText, contextText })
		})
			.then((response) => response.json())
			.then((data) => console.log(data))
			.catch((error) => console.error('Error:', error));
	}
}
chrome.runtime.onMessage.addListener(uploadSelected);

chrome.runtime.onInstalled.addListener(() => {
	chrome.contextMenus.create({
		id: 'loginStatus',
		title: 'Checking login status...', // Temporary title
		contexts: ['all'],
		documentUrlPatterns: ['<all_urls>']
	});
});

function updateContextMenu(loggedIn) {
	const title = loggedIn ? 'User is logged in' : 'User is not logged in';
	chrome.contextMenus.update('loginStatus', { title: title });
}
async function onCMclick(info, tab) {
	if (info.menuItemId === 'loginStatus') {
		chrome.sidePanel.open({ tabId: tab.id });
		console.log('url', await chrome.tabs.query({ active: true, currentWindow: true }));
		// doenst work.. mby await chrome.tabs.sendMessage(tab.id, message);?
		await chrome.tabs.sendMessage(tab.id, { action: 'getHighlightedText' });
	}
}
// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
// 	const DOMAIN = 'http://localhost:5173'; // Replace with your domain
// 	if (request.action === 'uploadText') {
// 		const { selectedText, contextText } = request;
// 		fetch(`${DOMAIN}/api/upload`, {
// 			method: 'POST',
// 			headers: { 'Content-Type': 'application/json' },
// 			body: JSON.stringify({
// 				selectedText,
// 				contextText
// 				// website_title,
// 				// website_url
// 			})
// 		});
// 	}
// 	// args: [DOMAIN, tab.title, tab.url]
// });

async function onCmClick(info, tab) {
	chrome.sidePanel.open({ tabId: tab.id });
	const DOMAIN = 'http://localhost:5173'; // Replace with your domain
	await chrome.scripting.executeScript({
		target: { tabId: tab.id },
		function: (DOMAIN, website_title, website_url) => {
			let selectedText = getSelection().toString();
			let contextText = getSelection().anchorNode.textContent;
			fetch(`${DOMAIN}/api/upload`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					selectedText,
					contextText,
					website_title,
					website_url
				})
			});
		},
		args: [DOMAIN, tab.title, tab.url]
	});
}
chrome.contextMenus.onClicked.addListener(onCMclick);

// This function checks the user's login status.
async function checkLoginStatus() {
	const DOMAIN = 'http://localhost:5173'; // Replace with your domain

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
