import { parseHTML } from 'linkedom';
import TurndownService from 'turndown';

const turndownService = new TurndownService();

chrome.runtime.onMessage.addListener(async (request) => {
  if (request.action === 'getMarkdown') {
    const { document } = parseHTML(request.html);
    const markdown = turndownService.turndown(document.body.innerHTML);
    chrome.runtime.sendMessage({
      action: 'markdown',
      markdown,
      senderTabId: request.senderTabId,
    });
  }
});
