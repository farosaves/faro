console.log("hello");
chrome.runtime.sendMessage({ action: "loadDeps" });
const applierOptions = {
  elementProperties: {
    style: { textDecoration: "underline", textDecorationStyle: "dotted" },
    tabIndex: -1
  }
};
function wrapSelectedText(uuid) {
  let createClassApplier = rangy.createClassApplier;
  let createHighlighter = rangy.createHighlighter;
  const classname = "_" + uuid;
  const hl = createHighlighter();
  const app = createClassApplier(classname, applierOptions);
  const selection = rangy.getSelection();
  hl.addClassApplier(app);
  hl.highlightSelection(classname, { selection });
  const ser = hl.serialize(selection);
  console.log(ser);
  return ser;
}
let batchDeserialize = (uss) => uss.forEach(([uuid, serialized]) => {
  let createClassApplier = rangy.createClassApplier;
  let createHighlighter = rangy.createHighlighter;
  if (!serialized)
    return;
  console.log("deserializeing", uuid, serialized);
  const hl = createHighlighter();
  const app = createClassApplier("_" + uuid, applierOptions);
  const legacyapp = createClassApplier(uuid, applierOptions);
  hl.addClassApplier(app);
  hl.addClassApplier(legacyapp);
  hl.deserialize(serialized);
});
let gotoText = (uuid) => {
  const elem = document.getElementsByClassName("_" + uuid).item(0);
  elem.scrollIntoView({ block: "center" });
  const sc = elem.style.backgroundColor;
  elem.style.backgroundColor = "#fff200";
  setTimeout(() => {
    elem.style.backgroundColor = sc;
  }, 1e3);
};
let isParagraph = (node, n = 2) => node.textContent.split(/[\.\?!]/u).filter((s) => s.length > 4).length > n;
let walkup2 = (node) => isParagraph(node, 4) ? node : walkup2(node.parentElement);
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getHighlightedText") {
    const { website_title, website_url, uuid } = request;
    const selectedText = window.getSelection().toString();
    console.log(selectedText, window.getSelection().anchorNode.textContent);
    console.log(rangy.createRange());
    const serialized = wrapSelectedText(uuid);
    console.log(window.getSelection().anchorNode);
    let html = walkup2(window.getSelection().anchorNode.parentElement).innerHTML;
    gotoText(uuid);
    chrome.runtime.sendMessage({
      action: "uploadText",
      selectedText,
      html,
      website_title,
      website_url,
      uuid,
      serialized
    });
  }
  if (request.action === "goto")
    gotoText(request.uuid);
  if (request.action === "deserialize")
    batchDeserialize(request.uss);
});
