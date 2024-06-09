function getContent() {
    return document.body.innerText;
  }
  
  // Listen for messages from the popup script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getContent") {
        const content = getContent();
        sendResponse({ content: content });
    }
});
  