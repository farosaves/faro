import 'chrome';
console.log('hello');

// now we also need node text - to make sure that if highlight was from a different node in the paragraph we capture the correct one
let node2context = (node) =>
	node.textContent.split(/\p{P}/u).filter((s) => s.length > 4).length > 1 // at least 2 sentences
		? node.textContent
		: node2context(node.parentElement);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.action === 'getHighlightedText') {
		const { website_title, website_url } = request;
		const selectedText = window.getSelection().toString();
		console.log({ selectedText });
		const contextText = node2context(window.getSelection().anchorNode);
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
