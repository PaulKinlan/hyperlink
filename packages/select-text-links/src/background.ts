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
      const result = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: getLinksInSelection,
      });

      console.log('Result from content script:', result);
      if (!result || result.length === 0) {
        console.log('No result from content script');
        return;
      }
      const links = result[0].result as string[];

      if (links && links.length > 0) {
        // Open each link in a new tab
        for (const link of links) {
          chrome.tabs.create({ url: link, active: false });
        }
      }
    } catch (error) {
      console.error('Error getting links from selection:', error);
    }
  }
});

// Function to get all links within the current selection
function getLinksInSelection(): string[] {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return [];
  }

  const linksSet = new Set<string>();

  // Get the range of the selection
  const range = selection.getRangeAt(0);

  // Create a document fragment from the range
  const fragment = range.cloneContents();

  // Find all anchor elements in the selection
  const anchorElements = fragment.querySelectorAll('a[href]');

  anchorElements.forEach((anchor) => {
    const href = (anchor as HTMLAnchorElement).href;
    if (href) {
      linksSet.add(href);
    }
  });

  // Also check if the selection itself starts or ends within an anchor element
  const container = range.commonAncestorContainer;
  const parentElement =
    container.nodeType === Node.TEXT_NODE
      ? container.parentElement
      : (container as Element);

  if (parentElement) {
    // Check if the selection is within an anchor or contains anchors
    const closestAnchor = parentElement.closest('a[href]');
    if (closestAnchor) {
      const href = (closestAnchor as HTMLAnchorElement).href;
      if (href) {
        linksSet.add(href);
      }
    }

    // Find all anchors within the common ancestor to limit scope
    const ancestorAnchors = parentElement.querySelectorAll('a[href]');
    ancestorAnchors.forEach((anchor) => {
      if (selection.containsNode(anchor, true)) {
        const href = (anchor as HTMLAnchorElement).href;
        if (href) {
          linksSet.add(href);
        }
      }
    });
  }

  return Array.from(linksSet);
}
