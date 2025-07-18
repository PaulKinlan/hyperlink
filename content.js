const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=';

async function updateBlockquotes() {
  const blockquotes = document.querySelectorAll('blockquote[href]');

  for (const blockquote of blockquotes) {
    const url = blockquote.getAttribute('href');
    const originalText = blockquote.textContent.trim();

    try {
      let textToUpdate = originalText;

      if (url.includes('#:~:text=')) {
        // Handle text fragments
        const textFragment = url.split('#:~:text=')[1];
        const decodedFragment = decodeURIComponent(textFragment);
        const [prefix, textStart, textEnd, suffix] = decodedFragment.split(',');

        // This is a simplified implementation. A more robust solution would
        // involve finding the text on the page.
        textToUpdate = textStart;

      } else {
        // Handle standard URLs
        const response = await chrome.runtime.sendMessage({ action: 'fetchUrl', url });
        if (response.error) {
          console.error('Error fetching URL:', response.error);
          blockquote.style.border = '2px solid red';
          blockquote.title = `Error fetching URL: ${response.error}`;
          continue;
        }

        const fetchedText = response.text;
        const { text: updatedText } = await getUpdatedText(originalText, fetchedText);
        textToUpdate = updatedText;
      }

      if (textToUpdate && textToUpdate.trim() !== originalText) {
        blockquote.textContent = textToUpdate;
        blockquote.style.border = '2px solid green';
        blockquote.title = 'Content updated!';
      }
    } catch (error) {
      console.error('Error updating blockquote:', error);
      blockquote.style.border = '2px solid red';
      blockquote.title = `Error updating blockquote: ${error.message}`;
    }
  }
}

async function getUpdatedText(originalText, fetchedText) {
  const apiKey = await new Promise((resolve) => {
    chrome.storage.sync.get('apiKey', (data) => {
      resolve(data.apiKey);
    });
  });

  if (!apiKey) {
    const errorMessage = 'Gemini API key not found. Please set it in the extension options.';
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  const prompt = `I have a blockquote on my webpage with the following text: "${originalText}". This blockquote is linked to a URL. I have fetched the content of that URL, which is provided below.

Please analyze the fetched text and identify the section that corresponds to the original blockquote. Then, provide the most up-to-date version of that section.

If you can find the corresponding section, please return only the updated text. If you cannot, please return the original text.

Fetched Text:
${fetchedText}`;

  const response = await fetch(`${GEMINI_API_URL}${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt,
        }],
      }],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    const errorMessage = `Gemini API error: ${errorData.error.message}`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  const data = await response.json();
  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
    const errorMessage = 'Unexpected response from Gemini API';
    console.error(errorMessage, data);
    throw new Error(errorMessage);
  }

  const text = data.candidates[0].content.parts[0].text;
  return { text };
}

updateBlockquotes();
