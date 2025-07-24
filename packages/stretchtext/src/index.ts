import { GoogleGenAI } from '@google/genai';

chrome.runtime.onMessage.addListener(async (request, sender) => {
  if (request.action === 'expand' || request.action === 'summarize') {
    chrome.storage.sync.get('apiKey', async (data) => {
      if (data.apiKey) {
        const genAI = new GoogleGenAI(data.apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        const prompt =
          request.action === 'expand'
            ? `Expand the following text:\n\n${request.text}`
            : `Summarize the following text:\n\n${request.text}`;

        try {
          const result = await model.generateContent(prompt);
          const response = await result.response;
          const text = response.text();
          chrome.tabs.sendMessage(sender.tab.id, {
            action: 'replace',
            text,
          });
        } catch (error) {
          console.error(`Error with Gemini API: ${error}`);
          chrome.tabs.sendMessage(sender.tab.id, {
            action: 'replace',
            text: `Error: ${error.message}`,
          });
        }
      } else {
        chrome.tabs.sendMessage(sender.tab.id, {
          action: 'replace',
          text: 'API key not set. Please set it in the options page.',
        });
      }
    });
  }
});
