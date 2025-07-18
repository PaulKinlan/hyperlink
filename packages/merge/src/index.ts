import TurndownService from 'turndown';
import { GoogleGenerativeAI } from '@google/genai';

const turndownService = new TurndownService();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'merge') {
    chrome.storage.sync.get('apiKey', async (data) => {
      if (data.apiKey) {
        const genAI = new GoogleGenerativeAI(data.apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        try {
          const response = await fetch(request.url);
          const html = await response.text();
          const markdown = turndownService.turndown(html);
          const result = await model.generateContent(
            `Please merge the following markdown content into the parent element, preserving existing links and styling.
            Parent element:
            ${request.parent}

            Markdown content:
            ${markdown}`,
          );
          const text = await result.response.text();
          if (sender.tab && sender.tab.id) {
            chrome.tabs.sendMessage(sender.tab.id, {
              action: 'mergedContent',
              content: text,
              parent: request.parent,
              url: request.url,
            });
          }
        } catch (error) {
          console.error('Error merging content:', error);
        }
      } else {
        console.error('API key not found');
      }
    });
  }
  return true;
});
