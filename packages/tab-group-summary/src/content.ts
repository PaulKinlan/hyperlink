import './turndown.js';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getMarkdown') {
    const turndownService = new TurndownService();
    const markdown = turndownService.turndown(document.body.innerHTML);
    sendResponse({ markdown });
  }
});
