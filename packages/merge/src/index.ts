import { GoogleGenAI } from '@google/genai';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'merge') {
    chrome.storage.sync.get('apiKey', async (data) => {
      if (data.apiKey) {
        const genAI = new GoogleGenAI({ apiKey: data.apiKey });
        const model = 'gemini-2.0-flash';
        const config = { tools: [], responseMimeType: 'text/plain' };

        const { localHTML, localMarkdown, targetHref, targetWindow } = request;

        try {
          const contents = [
            {
              role: 'user',
              parts: [
                {
                  text: `
You are a tool that merges the content of a link into the existing paragraph and returns valid HTML that includes the content of the link while preserving the context and flow of the original text.

The original HTML content will be provided in the <localHTML> tag.
The local markdown content will be provided in the <localMarkdown> tag.
The markdown content of the page (${targetHref}) window will be provided in the <targetWindow> tag.

Your goal is to merge the content of the link into the existing paragraph, ensuring that the context is preserved and the content flows naturally, while providing a coherent and readable output that integrates the new information seamlessly.

The link should still be present in the merged content.

<localHTML>
  ${localHTML}
</localHTML>

<localMarkdown>
${localMarkdown}
</localMarkdown>

<targetWindow>
${targetWindow}
</targetWindow>`,
                },
              ],
            },
          ];

          const result = await genAI.models.generateContent({
            model,
            config,
            contents,
          });
          const text = result.text;
          if (sender.tab && sender.tab.id) {
            sendResponse({
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

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === 'openLinkForMarkdown') {
    const tab = await chrome.tabs.create({ url: request.url });
    await chrome.tabs.update(sender.tab?.id || -1, { active: true });

    chrome.tabs.onUpdated.addListener(async (updatedTabId, changeInfo) => {
      if (updatedTabId === tab.id && changeInfo.status === 'complete') {
        const { markdown } = await chrome.tabs.sendMessage(updatedTabId, {
          action: 'getMarkdown',
        });

        sendResponse({
          markdown: markdown,
          senderTabId: sender.tab?.id,
        });

        chrome.tabs.remove(updatedTabId); // Clean up the tab after getting markdown
      }
    });
  }
});
