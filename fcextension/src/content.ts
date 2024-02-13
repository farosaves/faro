// import 'chrome';
// import rangy from 'rangy'
// import {createHighlighter} from "@rangy/highlighter"
// import {createClassApplier} from "@rangy/classapplier"
// import { makeQCH } from "../ lib/shared/snippetiser/main";
import { makeQCH } from '../src/lib/shared/snippetiser/main';

console.log('hello');
chrome.runtime.sendMessage({ action: 'loadDeps' });

const applierOptions = {
	elementProperties: {
		style: { textDecoration: 'underline', textDecorationStyle: 'dotted' },
		tabIndex: -1
	}
};
function wrapSelectedText(uuid) {
	let createClassApplier = rangy.createClassApplier;
	let createHighlighter = rangy.createHighlighter;

	const classname = '_' + uuid;
	const hl = createHighlighter();
	const app = createClassApplier(classname, applierOptions);
	const selection = rangy.getSelection();
	hl.addClassApplier(app);
	hl.highlightSelection(classname, { selection });
	const ser = hl.serialize(selection);
	console.log(ser);
	return ser;
}

let batchDeserialize = (uss) =>
	uss.forEach(([uuid, serialized]) => {
		let createClassApplier = rangy.createClassApplier;
		let createHighlighter = rangy.createHighlighter;
		if (!serialized) return;
		console.log('deserializeing', uuid, serialized);
		const hl = createHighlighter();
		const app = createClassApplier('_' + uuid, applierOptions);
		const legacyapp = createClassApplier(uuid, applierOptions);
		hl.addClassApplier(app);
		hl.addClassApplier(legacyapp);
		hl.deserialize(serialized);
	});

let gotoText = (uuid) => {
	const elem = document.getElementsByClassName('_' + uuid).item(0);
	elem.scrollIntoView({ block: 'center' });
	const sc = elem.style.backgroundColor;
	elem.style.backgroundColor = '#fff200';
	setTimeout(() => {
		elem.style.backgroundColor = sc;
	}, 1000);
};
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
		console.log(window.getSelection().anchorNode);
		// let html = walkup2(window.getSelection().anchorNode.parentElement).innerHTML;
		gotoText(uuid);

		// const { selectedText, packed_context, website_url, website_title, uuid, serialized } = input;
		console.log('uploading...:', { selectedText, website_url });
		const { quote, highlights, context } = makeQCH(document, uuid, selectedText);
		if (!quote) return { note_data: null };
		const note_data = {
			quote,
			source_id: -1,
			highlights,
			context,
			snippet_uuid: uuid,
			serialized_highlight: serialized,
			sources: { title: website_title, url: website_url }
		};
		// supa_update(locals.supabase, note_data).then(console.log);
		// return { note_data };
		// }),

		chrome.runtime.sendMessage({
			action: 'uploadText',
			note_data
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
