let creating: Promise<void> | null; // A global promise to avoid race conditions

async function setupOffscreenDocument(path: string) {
  // Check all windows controlled by the extension to see if one has the offscreen document
  const offscreenUrl = chrome.runtime.getURL(path);
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT'],
    documentUrls: [offscreenUrl],
  });

  if (existingContexts.length > 0) {
    return;
  }

  // create offscreen document
  if (creating) {
    await creating;
  } else {
    creating = chrome.offscreen.createDocument({
      url: path,
      reasons: ['USER_MEDIA'],
      justification: 'transcribe audio',
    });
    await creating;
    creating = null;
  }
}

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.type === 'find-audio-fragment') {
    await setupOffscreenDocument('offscreen.html');
    chrome.runtime.sendMessage(message);
  } else if (message.type === 'audio-fragment-found') {
    // Forward the message to the content script
    const tabId = sender.tab?.id;
    if (tabId) {
      chrome.tabs.sendMessage(tabId, message);
    }
  }
});
