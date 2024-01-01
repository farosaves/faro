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
