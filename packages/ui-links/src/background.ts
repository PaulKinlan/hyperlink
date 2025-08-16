chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'ui-link-capture',
    enabled: false,
    title: 'Capture UI Element',
    contexts: ['link'],
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.message !== 'updateContextMenu') {
    return;
  }

  chrome.contextMenus.update('ui-link-capture', {
    enabled: !!message.enabled,
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== 'ui-link-capture' || !info.linkUrl || !tab?.id) {
    return;
  }
  const sourceTabId = tab.id;

  const url = new URL(info.linkUrl);
  const hash = url.hash.slice(1); // Remove the '#'
  const params = new URLSearchParams(hash);
  const selector = params.get(':ui:');

  if (!selector) {
    return;
  }

  // 1. Create the new tab
  const targetTab = await chrome.tabs.create({
    url: info.linkUrl,
    active: false,
  });

  if (!targetTab.id) {
    return;
  }

  chrome.tabs.onUpdated.addListener(async (updatedTabId, changeInfo) => {
    if (updatedTabId === targetTab.id && changeInfo.status === 'complete') {
      const { elementImageData, svgElement, width, height } =
        await chrome.tabs.sendMessage(targetTab.id, {
          type: 'GET_UI',
          payload: {
            elementSelector: selector,
          },
        });

      await chrome.tabs.sendMessage(sourceTabId, {
        type: 'SHOW_UI',
        payload: {
          elementImageData,
          svgElement,
          width,
          height,
          linkUrl: info.linkUrl,
        },
      });
      // chrome.tabs.remove(updatedTabId); // Clean up the tab after getting markdown
    }
  });
});
