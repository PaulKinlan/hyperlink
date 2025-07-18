let popover: HTMLElement | null = null;
let currentAnchor: HTMLAnchorElement | null = null;
let lastHoveredLink: HTMLAnchorElement | null = null;
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

const showSummaryPopover = (link: HTMLAnchorElement) => {
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
  popover.style.setProperty('top', 'anchor(bottom)');
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
};

document.addEventListener('mouseover', (e) => {
  const target = e.target as HTMLElement;
  if (target.tagName === 'A') {
    lastHoveredLink = target as HTMLAnchorElement;
    if (e.ctrlKey || e.altKey) {
      showSummaryPopover(lastHoveredLink);
    }
  }
});

document.addEventListener('mouseout', (e) => {
  const target = e.target as HTMLElement;
  if (target.tagName === 'A') {
    lastHoveredLink = null;
  }
});

document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.altKey) && lastHoveredLink) {
    showSummaryPopover(lastHoveredLink);
  }
});

document.addEventListener('keyup', (e) => {
  if (!e.ctrlKey && !e.altKey) {
    cleanup();
  }
});

chrome.runtime.onMessage.addListener((request) => {
  if (request.action === 'summary' && popover) {
    popover.textContent = request.summary;
  }
});
