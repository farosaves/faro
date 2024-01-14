import 'chrome';
// seems this doesn't work, maybe because content.js is per-page, so doesn't do installation?
// chrome.runtime.onInstalled.addListener(function () {
//   chrome.action.onClicked.addListener(function (tab) {
//     chrome.scripting.executeScript({
//       target: { tabId: tab.id },
//       function: sendHighlightedText,
//     });
//   });
// });

// function sendHighlightedText() {
//   const text = window.getSelection().toString();
//   console.log({ text: text });
//   if (text) {
//     chrome.runtime.sendMessage({ text: text });
//   } else {
//     chrome.runtime.sendMessage({ error: "No text selected." });
//   }
// }
console.log('hello');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.action === 'getHighlightedText') {
		const { website_title, website_url } = request;
		const selectedText = window.getSelection().toString();
		console.log({ selectedText });
		const contextText = window.getSelection().anchorNode.textContent;
		chrome.runtime.sendMessage({
			action: 'uploadText',
			selectedText,
			contextText,
			website_title,
			website_url
		});
	}
});

function sendHighlightedText() {
	const text = window.getSelection().toString();
	if (text) {
		chrome.runtime.sendMessage({ text: text });
	} else {
		chrome.runtime.sendMessage({ error: 'No text selected.' });
	}
}

// const DOMAIN = 'http://localhost:5173'; // Replace with your domain
// chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
// 	const DOMAIN = 'http://localhost:5173'; // Replace with your domain
// 	if (request.action === 'uploadText') {
// 		const { selectedText, contextText } = request;
// 		// console.log({ selectedText,  });
// 		fetch(`${DOMAIN}/api/upload`, {
// 			method: 'POST',
// 			headers: { 'Content-Type': 'application/json' },
// 			body: JSON.stringify({ selectedText, contextText })
// 		})
// 			.then((response) => response.json())
// 			.then((data) => console.log(data))
// 			.catch((error) => console.error('Error:', error));
// 	}
// });
