import {
  ProviderFactory,
  StorageManager,
  type ProviderConfig,
} from '@hyperlink-experiments/shared';

const storageManager = new StorageManager('merge');

async function getActiveProvider(): Promise<ProviderConfig | null> {
  return await storageManager.getActiveProvider();
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'merge') {
    (async () => {
      try {
        const providerConfig = await getActiveProvider();

        if (!providerConfig) {
          sendResponse({
            action: 'mergeError',
            error:
              'No active provider configured. Please configure a provider in the options page.',
          });
          return;
        }

        if (!providerConfig.enabled) {
          sendResponse({
            action: 'mergeError',
            error:
              'Active provider is disabled. Please enable it in the options page.',
          });
          return;
        }

        const { localHTML, localMarkdown, targetHref, targetWindow } = request;

        const provider = ProviderFactory.create(providerConfig);

        const prompt = `You are a tool that merges the content of a link into the existing paragraph and returns valid HTML that includes the content of the link while preserving the context and flow of the original text.

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
</targetWindow>`;

        const text = await provider.generateText(prompt);

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
        sendResponse({
          action: 'mergeError',
          error:
            error instanceof Error
              ? error.message
              : 'An unknown error occurred',
        });
      }
    })();
    return true; // Required for async sendResponse
  }
  return false;
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'openLinkForMarkdown') {
    (async () => {
      try {
        const tab = await chrome.tabs.create({ url: request.url });
        await chrome.tabs.update(sender.tab?.id || -1, { active: true });

        const listener = async (updatedTabId: number, changeInfo: any) => {
          if (updatedTabId === tab.id && changeInfo.status === 'complete') {
            try {
              const response = await chrome.tabs.sendMessage(updatedTabId, {
                action: 'getMarkdown',
              });

              sendResponse({
                markdown: response.markdown,
                senderTabId: sender.tab?.id,
              });

              chrome.tabs.remove(updatedTabId);
              chrome.tabs.onUpdated.removeListener(listener);
            } catch (error) {
              console.error('Error getting markdown:', error);
              sendResponse({
                markdown: '',
                error: 'Failed to get markdown from linked page',
              });
              chrome.tabs.remove(updatedTabId);
              chrome.tabs.onUpdated.removeListener(listener);
            }
          }
        };

        chrome.tabs.onUpdated.addListener(listener);
      } catch (error) {
        console.error('Error opening link:', error);
        sendResponse({
          markdown: '',
          error: 'Failed to open linked page',
        });
      }
    })();
    return true; // Required for async sendResponse
  }
  return false;
});

// Create context menu
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'merge-link',
    title: 'Merge Link Content',
    contexts: ['link'],
  });
});

// Handle context menu click
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'merge-link' && info.linkUrl && tab?.id) {
    // Send message to content script to perform merge
    chrome.tabs.sendMessage(tab.id, {
      action: 'mergeFromContextMenu',
      linkUrl: info.linkUrl,
    });
  }
});
