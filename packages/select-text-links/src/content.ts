// Function to get all links within the current selection
function getLinksInSelection(): string[] {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return [];
  }

  const links: string[] = [];

  // Get the range of the selection
  const range = selection.getRangeAt(0);

  // Create a document fragment from the range
  const fragment = range.cloneContents();

  // Find all anchor elements in the selection
  const anchorElements = fragment.querySelectorAll('a[href]');

  anchorElements.forEach((anchor) => {
    const href = (anchor as HTMLAnchorElement).href;
    if (href && !links.includes(href)) {
      links.push(href);
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
      if (href && !links.includes(href)) {
        links.push(href);
      }
    }

    // Also find all anchors that intersect with the selection
    const allAnchors = document.querySelectorAll('a[href]');
    allAnchors.forEach((anchor) => {
      if (selection.containsNode(anchor, true)) {
        const href = (anchor as HTMLAnchorElement).href;
        if (href && !links.includes(href)) {
          links.push(href);
        }
      }
    });
  }

  return links;
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getLinksInSelection') {
    const links = getLinksInSelection();
    sendResponse({ links });
  }
  return true; // Indicates that the response will be sent asynchronously
});
