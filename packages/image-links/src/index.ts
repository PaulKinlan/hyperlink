const OFFSCREEN_DOCUMENT_PATH = 'offscreen.html';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  handleMessage(request, sender).then((response) => {
    console.log('Response from offscreen:', request, response);
    // Forward the response back to the content script
    sendResponse(response);
  });
  return true; // Keep the message channel open for async response
});

const handleMessage = async (request, sender) => {
  if (request.action === 'encodeImage') {
    // Create the offscreen document if it doesn't exist
    if (!(await hasOffscreenDocument())) {
      await chrome.offscreen.createDocument({
        url: OFFSCREEN_DOCUMENT_PATH,
        reasons: [chrome.offscreen.Reason.DOM_SCRAPING],
        justification: 'Analyzing images in the background',
      });
    }

    const imageResponse = await chrome.runtime.sendMessage({
      target: 'offscreen',
      action: 'encodeImage',
      name: request.name,
      imageData: request.imageData,
      height: request.height,
      width: request.width,
    });

    return imageResponse;
  } else if (request.action === 'decodeMask') {
    // Create the offscreen document if it doesn't exist
    if (!(await hasOffscreenDocument())) {
      await chrome.offscreen.createDocument({
        url: OFFSCREEN_DOCUMENT_PATH,
        reasons: [chrome.offscreen.Reason.DOM_SCRAPING],
        justification: 'Decoding masks in the background',
      });
    }

    const decodingResults = await chrome.runtime.sendMessage({
      target: 'offscreen',
      action: 'decodeMask',
      name: request.name,
      maskData: request.maskData,
    });

    return decodingResults;
  }
};

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
