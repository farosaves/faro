import 'chrome';
// import rangy from 'rangy'
console.log('hello');
const applierOptions = {
	elementProperties: {
		style: { textDecoration: 'underline', textDecorationStyle: 'dotted' },
		tabIndex: -1
	}
};
function wrapSelectedText(uuid) {
	const classname = '_' + uuid;
	const hl = rangy.createHighlighter();
	const app = rangy.createClassApplier(classname, applierOptions);
	const selection = rangy.getSelection();
	hl.addClassApplier(app);
	hl.highlightSelection(classname, { selection });
	const ser = hl.serialize(selection);
	console.log(ser);
	return ser;
}

let batchDeserialize = (uss) =>
	uss.forEach(([uuid, serialized]) => {
		if (!serialized) return;
		console.log('deserializeing', uuid, serialized);
		const hl = rangy.createHighlighter();
		const app = rangy.createClassApplier('_' + uuid, applierOptions);
		const legacyapp = rangy.createClassApplier(uuid, applierOptions);
		hl.addClassApplier(app);
		hl.addClassApplier(legacyapp);
		hl.deserialize(serialized);
	});

let gotoText = (uuid) =>
	document
		.getElementsByClassName('_' + uuid)
		.item(0)
		.focus();

// now we also need node text - to make sure that if highlight was from a different node in the paragraph we capture the correct one
let node2context = (node) =>
	node.textContent.split(/[\.\?!]/u).filter((s) => s.length > 4).length > 1 // at least 2 sentences
		? node.textContent
		: node2context(node.parentElement);

let isParagraph = (node, n = 2) =>
	node.textContent.split(/[\.\?!]/u).filter((s) => s.length > 4).length > n; // at least 3 sentences

let walkup = (node) =>
	isParagraph(node) ? [node.textContent] : [node.textContent, ...walkup(node.parentElement)];

let walkup2 = (node) => (isParagraph(node, 4) ? node : walkup2(node.parentElement));

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.action === 'getHighlightedText') {
		const { website_title, website_url, uuid } = request;
		const selectedText = window.getSelection().toString();
		console.log(selectedText, window.getSelection().anchorNode.textContent);
		console.log(rangy.createRange());
		const serialized = wrapSelectedText(uuid);
		console.log(window.getSelection().anchorNode)
		let html = walkup2(window.getSelection().anchorNode.parentElement).innerHTML;
		// html = html || walkup2(window.getSelection().anchorNode).textContent;
		gotoText(uuid);
		chrome.runtime.sendMessage({
			action: 'uploadText',
			selectedText,
			html,
			website_title,
			website_url,
			uuid,
			serialized
		});
	}
	if (request.action === 'goto') gotoText(request.uuid);
	if (request.action === 'deserialize') batchDeserialize(request.uss);
});

function sendHighlightedText() {
	const text = window.getSelection().toString();
	if (text) {
		chrome.runtime.sendMessage({ text: text });
	} else {
		chrome.runtime.sendMessage({ error: 'No text selected.' });
	}
}

chrome.runtime.sendMessage({ action: 'loadDeps' });
