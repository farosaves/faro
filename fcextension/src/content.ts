// import 'chrome';
// import { makeQCH } from "../ lib/shared/snippetiser/main";
import { makeQCH } from "./lib/shared/snippetiser/main";
import { Rangee } from "rangee";

console.log("hello");
let rangee: Rangee

const ran2sel = (rann: Range) => {
  let sel = rangy.getSelection();
  sel.setSingleRange(rann as RangyRange);
  return sel;
};

chrome.runtime.sendMessage({ action: "loadDeps" });

const applierOptions = {
  elementProperties: {
    style: { textDecoration: "underline", textDecorationStyle: "dotted" },
    tabIndex: -1,
  },
};
const deleteSelection = (uuid, serialized) => {
  let createClassApplier = rangy.createClassApplier;
  const classname = "_" + uuid;
  const elements = document.querySelectorAll(`.${classname}`);
  const last = elements[elements.length - 1]

  const app = createClassApplier(classname, applierOptions);
  // const ran = rangee.deserialize(serialized)
  const ran = rangy.createRange()
  ran.setStart(elements[0], 0)
  ran.setEnd(last, 0)
  app.undoToRange(ran)
}
function wrapSelectedText(uuid) {
  if (rangee === undefined) rangee = new Rangee({ document });

  let createClassApplier = rangy.createClassApplier;
  let createHighlighter = rangy.createHighlighter;

  const classname = "_" + uuid;
  const app = createClassApplier(classname, applierOptions);
  const ran = document.getSelection()?.getRangeAt(0)!;
  const ser = rangee.serialize(ran);
  const selection = ran2sel(ran)
  
  const hl = createHighlighter();
  hl.addClassApplier(app);
  hl.highlightSelection(classname, { selection });
  return ser;
}

const oldSerRegex = /^type:textContent/
let batchDeserialize = (uss) =>
  uss.forEach(([uuid, serialized]) => {
    if (rangee === undefined) rangee = new Rangee({ document });
    if (!serialized) return;
    let createClassApplier = rangy.createClassApplier;
    let createHighlighter = rangy.createHighlighter;
    console.log("deserializeing", uuid, serialized);
    const hl = createHighlighter();
    const app = createClassApplier("_" + uuid, applierOptions);
    hl.addClassApplier(app);
    if (oldSerRegex.test(serialized))
    hl.deserialize(serialized);
  else {
    const selection = ran2sel(rangee.deserialize(serialized))
    hl.highlightSelection("_" + uuid, { selection });
  }
  });

let gotoText = (uuid) => {
  const elems = document.getElementsByClassName("_" + uuid);
  elems.item(0).scrollIntoView({ block: "center" });
  Array.from(elems).forEach((elem) => {
    const sc = elem.style.backgroundColor;
    elem.style.backgroundColor = "#fff200";
    setTimeout(() => {
      elem.style.backgroundColor = sc;
    }, 1000);
  });
};
// now we also need node text - to make sure that if highlight was from a different node in the paragraph we capture the correct one
let node2context = (node) =>
  node.textContent.split(/[\.\?!]/u).filter((s) => s.length > 4).length > 1 // at least 2 sentences
    ? node.textContent
    : node2context(node.parentElement);

let isParagraph = (node, n = 2) =>
  node.textContent.split(/[\.\?!]/u).filter((s) => s.length > 4).length > n; // at least 3 sentences

let walkup = (node) =>
  isParagraph(node)
    ? [node.textContent]
    : [node.textContent, ...walkup(node.parentElement)];

let walkup2 = (node) =>
  isParagraph(node, 4) ? node : walkup2(node.parentElement);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getHighlightedText") {
    const { website_title, website_url, uuid } = request;
    const selectedText = window.getSelection().toString();
    console.log(selectedText, window.getSelection().anchorNode.textContent);
    console.log(rangy.createRange());
    const serialized = wrapSelectedText(uuid);
    console.log(window.getSelection().anchorNode);
    // let html = walkup2(window.getSelection().anchorNode.parentElement).innerHTML;
    gotoText(uuid);

    // const { selectedText, packed_context, website_url, website_title, uuid, serialized } = input;
    console.log("uploading...:", { selectedText, website_url });
    const { quote, highlights, context } = makeQCH(
      document,
      uuid,
      selectedText,
    );
    if (!quote) return { note_data: null };
    const note_data = {
      quote,
      source_id: -1,
      highlights,
      context,
      snippet_uuid: uuid,
      serialized_highlight: serialized,
      sources: { title: website_title, url: website_url },
    };
    // supa_update(locals.supabase, note_data).then(console.log);
    // return { note_data };
    // }),

    chrome.runtime.sendMessage({
      action: "uploadText",
      note_data,
    });
  }
  if (request.action === "goto") gotoText(request.uuid);
  if (request.action === "deserialize") batchDeserialize(request.uss);
  if (request.action === "delete") deleteSelection(request.uuid, request.serialized);
});

function sendHighlightedText() {
  const text = window.getSelection().toString();
  if (text) {
    chrome.runtime.sendMessage({ text: text });
  } else {
    chrome.runtime.sendMessage({ error: "No text selected." });
  }
}
