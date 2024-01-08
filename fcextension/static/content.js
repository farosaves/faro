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
import 'chrome';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.action === 'getHighlightedText') {
		const selectedText = window.getSelection().toString();
		console.log({ selectedText });
		const contextText = window.getSelection().anchorNode.textContent();
		chrome.runtime.sendMessage({
			action: 'highlightedText',
			selectedText,
			contextText
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
