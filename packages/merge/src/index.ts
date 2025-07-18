import { GoogleGenAI } from '@google/genai';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fetchUrl') {
    fetch(request.url)
      .then((response) => response.text())
      .then((text) => sendResponse({ text }))
      .catch((error) => sendResponse({ error: error.message }));
  }
  return true; // Indicates that the response is sent asynchronously
});

chrome.runtime.onMessage.addListener(async (request, sender) => {
  if (request.action === 'getUpdatedText') {
    const { originalText, fetchedText } = request;

    chrome.storage.sync.get('apiKey', async (data) => {
      if (data.apiKey) {
        const genAI = new GoogleGenAI(data.apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        const prompt = `I have a blockquote on my webpage with the following text: "${originalText}". This blockquote is linked to a URL. I have fetched the content of that URL, which is provided below.

Please analyze the fetched text and identify the section that corresponds to the original blockquote. Then, provide the most up-to-date version of that section.

If you can find the corresponding section, please return only the updated text. If you cannot, please return the original text.

Fetched Text:
${fetchedText}`;

        try {
          const result = await model.generateContent(prompt);
          const response = await result.response;
          const updatedText = response.text();

          if (sender.tab?.id) {
            chrome.tabs.sendMessage(sender.tab.id, {
              action: 'updatedText',
              updatedText,
              originalText,
            });
          }
        } catch (error) {
          console.error('Error updating text:', error);
          if (sender.tab?.id) {
            chrome.tabs.sendMessage(sender.tab.id, {
              action: 'updatedText',
              error: (error as Error).message,
              originalText,
            });
          }
        }
      } else {
        if (sender.tab?.id) {
          chrome.tabs.sendMessage(sender.tab.id, {
            action: 'updatedText',
            error: 'API key not set. Please set it in the options page.',
            originalText,
          });
        }
      }
    });
  }
});
