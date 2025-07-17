let popover: HTMLElement | null = null;
let currentAnchor: HTMLAnchorElement | null = null;
let anchorNameCounter = 0;

// Function to clean up previous popover and anchor
const cleanup = () => {
  if (popover) {
    try {
      popover.hidePopover();
    } catch (e) {
      // It might already be hidden or removed
    }
    popover.remove();
    popover = null;
  }
  if (currentAnchor) {
    currentAnchor.style.removeProperty('anchor-name');
    currentAnchor = null;
  }
};

document.addEventListener('mouseover', (e) => {
  const target = e.target as HTMLElement;
  if (target.tagName === 'A') {
    const link = target as HTMLAnchorElement;

    if (link === currentAnchor) {
      return;
    }

    cleanup();

    currentAnchor = link;

    const anchorName = `--summary-anchor-${anchorNameCounter++}`;
    link.style.setProperty('anchor-name', anchorName);

    popover = document.createElement('div');
    popover.setAttribute('popover', 'auto');
    popover.id = 'summary-popover';

    // Apply anchor positioning styles
    popover.style.position = 'absolute';
    popover.style.setProperty('position-anchor', anchorName);
    popover.style.setProperty('top', 'anchor(top)');
    popover.style.setProperty('left', 'anchor(left)');

    // Other styles
    popover.style.width = '300px';
    popover.style.border = '1px solid #ccc';
    popover.style.padding = '1em';
    popover.style.backgroundColor = 'white';
    popover.style.zIndex = '9999';
    popover.style.margin = '8px';

    popover.textContent = 'Summarizing...';
    document.body.appendChild(popover);

    try {
      popover.showPopover();
    } catch (e) {
      console.error('Failed to show popover:', e);
      cleanup();
      return;
    }

    chrome.runtime.sendMessage({
      action: 'summarize',
      url: link.href,
    });
  }
});

// Hide popover when mouse leaves the link or the popover itself
document.addEventListener('mouseout', (e) => {
  if (!popover || !currentAnchor) {
    return;
  }

  const relatedTarget = e.relatedTarget as Node | null;

  // Don't hide if moving to the popover or a child of it
  if (relatedTarget === popover || popover.contains(relatedTarget)) {
    return;
  }

  // Don't hide if moving to the anchor link or a child of it
  if (
    relatedTarget === currentAnchor ||
    currentAnchor.contains(relatedTarget)
  ) {
    return;
  }

  cleanup();
});

// The popover itself can be moused over, so add a listener to it
// to prevent it from closing when moving from the anchor to the popover.
document.body.addEventListener('mouseout', (e) => {
  if (e.target === popover) {
    const relatedTarget = e.relatedTarget as Node | null;
    if (
      relatedTarget === currentAnchor ||
      (currentAnchor && currentAnchor.contains(relatedTarget))
    ) {
      return;
    }
    cleanup();
  }
});

chrome.runtime.onMessage.addListener((request) => {
  if (request.action === 'summary' && popover) {
    popover.textContent = request.summary;
  }
});
