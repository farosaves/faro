import 'chrome';
// import rangy from 'rangy'
console.log('hello');
function wrapSelectedText(uuid) {
	var selection = window.getSelection().getRangeAt(0);
	var selectedText = selection.extractContents();
	var span = document.createElement('u');
	span.tabIndex = -1;
	span.appendChild(selectedText);
	span.id = uuid;
	selection.insertNode(span);
	span.focus();
}
const applierOptions = {
	elementProperties: {
		style: { textDecoration: 'underline', textDecorationStyle: 'dotted' },
		tabIndex: -1
	}
};
function wrapSelectedText(uuid) {
	const hl = rangy.createHighlighter();
	const app = rangy.createClassApplier(uuid, applierOptions);
	hl.addClassApplier(app);
	hl.highlightSelection(uuid);
}
let gotoText = (uuid) => document.getElementsByClassName(uuid).item(0).focus();

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
		const { website_title, website_url, uuid } = request;
		const selectedText = window.getSelection().toString();
		const nodeText = window.getSelection().anchorNode.textContent;
		console.log({ selectedText, nodeText });
		console.log(rangy.createRange());
		const contextTexts = walkup(window.getSelection().anchorNode);
		wrapSelectedText(uuid);
		gotoText(uuid);
		chrome.runtime.sendMessage({
			action: 'uploadText',
			selectedText,
			contextTexts,
			website_title,
			website_url,
			uuid
		});
	}
	if (request.action === "goto")
		gotoText(request.uuid)
	
});

function sendHighlightedText() {
	const text = window.getSelection().toString();
	if (text) {
		chrome.runtime.sendMessage({ text: text });
	} else {
		chrome.runtime.sendMessage({ error: 'No text selected.' });
	}
}

chrome.runtime.sendMessage({ action: 'loadDeps'});
