import { GoogleGenAI } from '@google/genai';

const OFFSCREEN_DOCUMENT_PATH = 'offscreen.html';

chrome.runtime.onMessage.addListener(async (request, sender) => {
  if (request.action === 'summarize') {
    // Create the offscreen document if it doesn't exist
    if (!(await hasOffscreenDocument())) {
      await chrome.offscreen.createDocument({
        url: OFFSCREEN_DOCUMENT_PATH,
        reasons: [chrome.offscreen.Reason.DOM_PARSER],
        justification: 'Parse HTML to get markdown for summary',
      });
    }

    // Fetch the HTML content
    const response = await fetch(request.url);
    const html = await response.text();

    // Send a message to the offscreen document to get the markdown
    chrome.runtime.sendMessage({
      action: 'getMarkdown',
      html,
      senderTabId: sender.tab.id,
    });
  }
});

chrome.runtime.onMessage.addListener(async (request, sender) => {
  if (request.action === 'markdown') {
    // Close the offscreen document
    await chrome.offscreen.closeDocument();

    // Now summarize the markdown
    chrome.storage.sync.get('apiKey', async (data) => {
      if (data.apiKey) {
        const genAI = new GoogleGenAI({ apiKey: data.apiKey });
        const model = 'gemini-2.0-flash';
        const config = { tools: [], responseMimeType: 'text/plain' };
        const contents = [
          {
            role: 'user',
            parts: [
              {
                text: `Summarize the following article:\n\n${request.markdown}`,
              },
            ],
          },
        ];

        try {
          const result = await genAI.models.generateContent({
            model,
            config,
            contents,
          });
          const summary = result.text;
          if (sender.id == chrome.runtime.id) {
            chrome.tabs.sendMessage(request.senderTabId, {
              action: 'summary',
              summary,
            });
          }
        } catch (error) {
          console.error('Error summarizing:', error);
          if (sender.tab?.id) {
            chrome.tabs.sendMessage(request.senderId, {
              action: 'summary',
              summary: 'Error summarizing content.',
            });
          }
        }
      } else {
        if (sender.tab?.id) {
          chrome.tabs.sendMessage(sender.tab.id, {
            action: 'summary',
            summary: 'API key not set. Please set it in the options page.',
          });
        }
      }
    });
  }
});

async function hasOffscreenDocument() {
  // @ts-expect-error - clients is not in the types
  const matchedClients = await clients.matchAll();
  for (const client of matchedClients) {
    if (client.url.endsWith(OFFSCREEN_DOCUMENT_PATH)) {
      return true;
    }
  }
  return false;
}
