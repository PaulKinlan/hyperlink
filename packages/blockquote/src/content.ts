async function updateBlockquotes() {
  const blockquotes = document.querySelectorAll('blockquote[href]');

  for (const blockquote of blockquotes) {
    const bq = blockquote as HTMLElement;
    const url = bq.getAttribute('href');
    const originalText = bq.textContent?.trim() ?? '';

    try {
      if (url && url.includes('#:~:text=')) {
        // Handle text fragments
        const textFragment = url.split('#:~:text=')[1];
        const decodedFragment = decodeURIComponent(textFragment);
        const [, textStart] = decodedFragment.split(',');

        // This is a simplified implementation. A more robust solution would
        // involve finding the text on the page.
        const textToUpdate = textStart;

        if (textToUpdate && textToUpdate.trim() !== originalText) {
          bq.textContent = textToUpdate;
          bq.style.border = '2px solid green';
          bq.title = 'Content updated!';
        }
      } else if (url) {
        // Handle standard URLs
        const response = await chrome.runtime.sendMessage({
          action: 'fetchUrl',
          url,
        });
        if (response.error) {
          console.error('Error fetching URL:', response.error);
          bq.style.border = '2px solid red';
          bq.title = `Error fetching URL: ${response.error}`;
          continue;
        }

        const fetchedText = response.text;
        chrome.runtime.sendMessage({
          action: 'getUpdatedText',
          originalText,
          fetchedText,
        });
      }
    } catch (error) {
      console.error('Error updating blockquote:', error);
      bq.style.border = '2px solid red';
      bq.title = `Error updating blockquote: ${(error as Error).message}`;
    }
  }
}

chrome.runtime.onMessage.addListener((request) => {
  if (request.action === 'updatedText') {
    const { updatedText, originalText, error } = request;

    const blockquote = Array.from(
      document.querySelectorAll('blockquote[href]'),
    ).find((bq) => bq.textContent?.trim() === originalText);
    const bq = blockquote as HTMLElement | undefined;

    if (bq) {
      if (error) {
        console.error('Error updating text:', error);
        bq.style.border = '2px solid red';
        bq.title = `Error updating text: ${error}`;
        return;
      }

      if (updatedText && updatedText.trim() !== originalText) {
        bq.textContent = updatedText;
        bq.style.border = '2px solid green';
        bq.title = 'Content updated!';
      }
    }
  }
});

updateBlockquotes();
