import {
  StorageManager,
  ProviderFactory,
  type ProviderConfig,
} from '@hyperlink-experiments/shared';

const OFFSCREEN_DOCUMENT_PATH = 'offscreen.html';
const storageManager = new StorageManager('summary');

async function getActiveProvider(): Promise<ProviderConfig | null> {
  return await storageManager.getActiveProvider();
}

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
      senderTabId: sender.tab?.id,
    });
  }
});

chrome.runtime.onMessage.addListener(async (request, sender) => {
  if (request.action === 'markdown') {
    // Close the offscreen document
    await chrome.offscreen.closeDocument();

    // Now summarize the markdown
    const providerConfig = await getActiveProvider();

    if (!providerConfig) {
      if (request.senderTabId) {
        chrome.tabs.sendMessage(request.senderTabId, {
          action: 'summary',
          summary:
            'No active provider configured. Please configure a provider in the options page.',
        });
      }
      return;
    }

    if (!providerConfig.enabled) {
      if (request.senderTabId) {
        chrome.tabs.sendMessage(request.senderTabId, {
          action: 'summary',
          summary:
            'Active provider is disabled. Please enable it in the options page.',
        });
      }
      return;
    }

    try {
      const provider = ProviderFactory.create(providerConfig);
      const summary = await provider.generateText(
        `Summarize the following article:\n\n${request.markdown}`,
      );

      if (sender.id === chrome.runtime.id && request.senderTabId) {
        chrome.tabs.sendMessage(request.senderTabId, {
          action: 'summary',
          summary,
        });
      }
    } catch (error) {
      console.error('Error summarizing:', error);
      if (request.senderTabId) {
        chrome.tabs.sendMessage(request.senderTabId, {
          action: 'summary',
          summary: `Error summarizing content: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      }
    }
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
