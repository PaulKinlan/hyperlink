import {
  StorageManager,
  ProviderFactory,
  type ProviderConfig,
} from '@hyperlink-experiments/shared';

const storageManager = new StorageManager('stretchtext');

async function getActiveProvider(): Promise<ProviderConfig | null> {
  return await storageManager.getActiveProvider();
}

chrome.runtime.onMessage.addListener(async (request, sender) => {
  if (request.action === 'expand' || request.action === 'summarize') {
    const providerConfig = await getActiveProvider();

    if (!providerConfig) {
      if (sender.tab?.id) {
        chrome.tabs.sendMessage(sender.tab.id, {
          action: 'replace',
          text: 'No active provider configured. Please configure a provider in the options page.',
          url: request.url,
          textFragment: request.textFragment,
          zoomLevel: request.zoomLevel,
        });
      }
      return;
    }

    if (!providerConfig.enabled) {
      if (sender.tab?.id) {
        chrome.tabs.sendMessage(sender.tab.id, {
          action: 'replace',
          text: 'Active provider is disabled. Please enable it in the options page.',
          url: request.url,
          textFragment: request.textFragment,
          zoomLevel: request.zoomLevel,
        });
      }
      return;
    }

    try {
      const provider = ProviderFactory.create(providerConfig);
      const prompt =
        request.action === 'expand'
          ? `Expand the following text:\n\n${request.text}`
          : `Summarize the following text:\n\n${request.text}`;

      const text = await provider.generateText(prompt);

      if (sender.tab?.id) {
        chrome.tabs.sendMessage(sender.tab.id, {
          action: 'replace',
          text,
          url: request.url,
          textFragment: request.textFragment,
          zoomLevel: request.zoomLevel,
        });
      }
    } catch (error) {
      console.error(`Error with AI provider: ${error}`);
      if (sender.tab?.id) {
        chrome.tabs.sendMessage(sender.tab.id, {
          action: 'replace',
          text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          url: request.url,
          textFragment: request.textFragment,
          zoomLevel: request.zoomLevel,
        });
      }
    }
  }
});
