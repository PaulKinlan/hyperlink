chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'openSelectedLinks',
    title: 'Open links in selection',
    contexts: ['selection'],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'openSelectedLinks' && tab?.id) {
    // Send message to content script to extract links from selection
    try {
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'getLinksInSelection',
      });

      if (response && response.links && response.links.length > 0) {
        // Open each link in a new tab
        for (const link of response.links) {
          chrome.tabs.create({ url: link, active: false });
        }
      }
    } catch (error) {
      console.error('Error getting links from selection:', error);
    }
  }
});
