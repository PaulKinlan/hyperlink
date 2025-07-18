import { GoogleGenAI } from '@google/genai';

let creating: Promise<void> | null;
const creatingTabs = new Map<number, Promise<chrome.tabs.Tab>>();
const activeSettingsTabId = new Map<number, number>(); // TabGroup to Tab ID mapping

chrome.tabGroups.onUpdated.addListener(async (tabGroup) => {
  // When a tab is added to a group, this listener is triggered.
  // We can then get all the tabs in the group and update the summary.
  const tabs = await chrome.tabs.query({ groupId: tabGroup.id });
  updateSummary(tabGroup.id, tabs);
});

async function updateSummary(groupId: number, tabs: chrome.tabs.Tab[]) {
  const summaryTab = await findOrCreateSummaryTab(groupId, tabs);

  if (summaryTab?.id) {
    // Clear the existing summary
    chrome.tabs.sendMessage(summaryTab.id, {
      action: 'updateSummary',
    });

    const tabsToSummarize = tabs.filter((tab) => tab.id !== summaryTab.id);

    if (tabsToSummarize.length > 0) {
      await setupOffscreenDocument(OFFSCREEN_DOCUMENT_PATH);

      const summaryPromises = tabsToSummarize.map(async (tab) => {
        const summary = await getSummary(tab);
        const screenshot = await chrome.tabs.captureVisibleTab(tab.windowId, {
          format: 'jpeg',
          quality: 50,
        });
        return {
          action: 'addSummary',
          summary,
          url: tab.url,
          title: tab.title,
          tabId: tab.id,
          screenshot,
        };
      });

      const summaries = await Promise.all(summaryPromises);

      for (const summary of summaries) {
        chrome.tabs.sendMessage(summaryTab.id, summary);
      }

      // Close the offscreen document
      await chrome.offscreen.closeDocument();
    }
  }
}

async function findOrCreateSummaryTab(
  groupId: number,
  tabs: chrome.tabs.Tab[],
) {
  if (activeSettingsTabId.has(groupId)) {
    const summaryTabId = await activeSettingsTabId.get(groupId);
    const tab = await chrome.tabs.update(summaryTabId, { active: true });
    if (tab == undefined) {
      console.error('Failed to update summary tab:', summaryTabId);
      return null;
    }
    await chrome.windows.update(tab.windowId, { focused: true });
    return tab;
  }
  const url = chrome.runtime.getURL('summary.html');

  const newTab = await chrome.tabs.create({
    url,
    index: 0,
    active: true,
  });

  if (newTab.id) {
    await chrome.tabs.group({
      groupId,
      tabIds: [newTab.id],
    });

    activeSettingsTabId.set(groupId, newTab.id);
  }
  return newTab;
}

const OFFSCREEN_DOCUMENT_PATH = 'offscreen.html';

// A global promise to avoid concurrency issues
async function setupOffscreenDocument(path: string) {
  // Check all windows controlled by the service worker to see if one
  // of them is the offscreen document with the given path
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
      reasons: [chrome.offscreen.Reason.DOM_PARSER],
      justification: 'Parse HTML for summarization',
    });
    await creating;
    creating = null;
  }
}

async function getSummary(tab: chrome.tabs.Tab): Promise<string> {
  return new Promise(async (resolve) => {
    if (!tab.id || !tab.url) {
      return resolve('');
    }

    const markdownListener = async (request) => {
      if (request.action === 'markdown' && request.senderTabId === tab.id) {
        // Remove the listener
        chrome.runtime.onMessage.removeListener(markdownListener);

        // Now summarize the markdown
        chrome.storage.sync.get('apiKey', async (data) => {
          if (data.apiKey) {
            const genAI = new GoogleGenAI({ apiKey: data.apiKey });
            const model = 'gemini-2.0-flash';
            const config = { tools: [], responseMimeType: 'text/plain' };
            const contents = [
              {
                role: 'user',
                parts: [
                  {
                    text: `Summarize the following article:\n\n${request.markdown}`,
                  },
                ],
              },
            ];

            try {
              const result = await genAI.models.generateContent({
                model,
                config,
                contents,
              });
              const summary = result.text;
              resolve(summary || 'No summary available.');
            } catch (error) {
              console.error('Error summarizing:', error);
              resolve('');
            }
          } else {
            resolve('API key not set.');
          }
        });
      }
    };

    chrome.runtime.onMessage.addListener(markdownListener);

    // Fetch the HTML content
    const response = await fetch(tab.url);
    const html = await response.text();

    // Send a message to the offscreen document to get the markdown
    chrome.runtime.sendMessage({
      action: 'getMarkdown',
      html,
      senderTabId: tab.id,
    });
  });
}
