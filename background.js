const CACHE_EXPIRATION_MS = 60 * 60 * 1000; // 1 hour

async function fetchAndCache(url) {
  const cachedData = await new Promise((resolve) => {
    chrome.storage.local.get(url, (data) => {
      resolve(data[url]);
    });
  });

  if (cachedData && Date.now() - cachedData.timestamp < CACHE_EXPIRATION_MS) {
    return cachedData.data;
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const text = await response.text();

  const dataToCache = {
    data: { text },
    timestamp: Date.now(),
  };

  await new Promise((resolve) => {
    chrome.storage.local.set({ [url]: dataToCache }, resolve);
  });

  return { text };
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fetchUrl') {
    fetchAndCache(request.url)
      .then(data => sendResponse(data))
      .catch(error => sendResponse({ error: error.message }));
  }
  return true; // Indicates that the response is sent asynchronously
});
