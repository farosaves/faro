const DOMAIN = import.meta.env.VITE_PI_IP.replace(/\/$/, ''); // Replace with your domain
const DEBUG = import.meta.env.DEBUG || false
// http://78.10.223.2:13723
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

chrome.webNavigation.onCompleted.addListener(() => {
	chrome.runtime.sendMessage({ action: 'update_curr_url' }).catch(e => console.log(e))
});

chrome.tabs.onActivated.addListener(() => {
	chrome.runtime.sendMessage({ action: 'update_curr_url' }).catch(e => console.log(e))
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

function getUuid() {
	try {
		return crypto.randomUUID();
	} catch {
		console.log('uuid fallback, nonsecure context?');
		// return Math.floor(Math.random() * 1_000_000).toString();
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
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false });
chrome.action.onClicked.addListener(activate);
