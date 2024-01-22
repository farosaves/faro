import 'chrome';
console.log('hello');

// now we also need node text - to make sure that if highlight was from a different node in the paragraph we capture the correct one
let node2context = (node) =>
	node.textContent.split(/[\.\?!]/u).filter((s) => s.length > 4).length > 1 // at least 2 sentences
		? node.textContent
		: node2context(node.parentElement);

let isParagraph = (node) =>
	node.textContent.split(/[\.\?!]/u).filter((s) => s.length > 4).length > 2; // at least 3 sentences

let walkup = (node) =>
	isParagraph(node) ? [node.textContent] : [node.textContent, ...walkup(node.parentElement)];

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.action === 'getHighlightedText') {
		const { website_title, website_url } = request;
		const selectedText = window.getSelection().toString();
		const nodeText = window.getSelection().anchorNode.textContent;
		console.log({ selectedText, nodeText });
		const contextTexts = walkup(window.getSelection().anchorNode);
		chrome.runtime.sendMessage({
			action: 'uploadText',
			selectedText,
			contextTexts,
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
