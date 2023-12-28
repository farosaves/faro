chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "uploadText") {
    fetch("https://flashcardize.com/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: request.text }),
    })
      .then((response) => response.json())
      .then((data) => console.log(data))
      .catch((error) => console.error("Error:", error));
  }
});
