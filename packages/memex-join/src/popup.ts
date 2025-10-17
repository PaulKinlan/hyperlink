interface Link {
  textFragment: string;
  targetLink: string;
}

interface StorageData {
  [url: string]: Link[];
}

let allLinksData: StorageData = {};
let currentUrl = '';

// Helper function to decode text fragment
function decodeTextFragment(textFragment: string): string {
  const fragmentWithoutPrefix = textFragment.replace('#:~:text=', '');
  let decodedText = '';

  if (fragmentWithoutPrefix.includes('-,')) {
    const parts = fragmentWithoutPrefix.split('-,');
    if (parts.length === 3) {
      decodedText = decodeURIComponent(parts[1]);
    } else if (parts.length === 2) {
      if (parts[0].includes(',')) {
        decodedText = decodeURIComponent(parts[0].split(',')[0]);
      } else {
        decodedText = decodeURIComponent(parts[1]);
      }
    } else {
      decodedText = decodeURIComponent(fragmentWithoutPrefix);
    }
  } else {
    decodedText = decodeURIComponent(fragmentWithoutPrefix);
  }

  return decodedText;
}

// Render all links with optional search filter
function renderAllLinks(searchTerm: string = '') {
  const linksList = document.getElementById('links-list');
  if (!linksList) return;

  linksList.innerHTML = '';
  let hasLinks = false;

  const lowerSearchTerm = searchTerm.toLowerCase();

  for (const url in allLinksData) {
    const links = allLinksData[url];
    if (!Array.isArray(links)) continue;

    // Filter links based on search term
    const filteredLinks = links.filter((link) => {
      if (!searchTerm) return true;
      const decodedText = decodeTextFragment(link.textFragment);
      return (
        decodedText.toLowerCase().includes(lowerSearchTerm) ||
        link.targetLink.toLowerCase().includes(lowerSearchTerm) ||
        url.toLowerCase().includes(lowerSearchTerm)
      );
    });

    if (filteredLinks.length === 0) continue;

    hasLinks = true;

    // Add URL title
    const urlTitle = document.createElement('h2');
    urlTitle.textContent = url;
    linksList.appendChild(urlTitle);

    // Add links
    const ul = document.createElement('ul');
    filteredLinks.forEach((link) => {
      const li = document.createElement('li');
      const wrapper = document.createElement('div');
      wrapper.className = 'link-item-wrapper';

      const linkContent = document.createElement('div');
      linkContent.className = 'link-content';

      const a = document.createElement('a');
      a.href = link.targetLink;
      const decodedText = decodeTextFragment(link.textFragment);
      a.textContent = `${decodedText} → ${link.targetLink}`;
      a.target = '_blank';

      linkContent.appendChild(a);

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-btn';
      deleteBtn.textContent = '🗑️';
      deleteBtn.title = 'Delete link';
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteLink(url, link);
      });

      wrapper.appendChild(linkContent);
      wrapper.appendChild(deleteBtn);
      li.appendChild(wrapper);
      ul.appendChild(li);
    });
    linksList.appendChild(ul);
  }

  if (!hasLinks) {
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    emptyState.textContent = searchTerm
      ? 'No links match your search.'
      : 'No links created yet. Select text and press Ctrl+Shift+K to create a link.';
    linksList.appendChild(emptyState);
  }
}

// Render current page links with optional search filter
function renderCurrentPageLinks(searchTerm: string = '') {
  const currentPageLinks = document.getElementById('current-page-links');
  if (!currentPageLinks) return;

  currentPageLinks.innerHTML = '';

  const links = allLinksData[currentUrl];
  if (!links || !Array.isArray(links)) {
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    emptyState.textContent = 'No links on this page yet.';
    currentPageLinks.appendChild(emptyState);
    return;
  }

  const lowerSearchTerm = searchTerm.toLowerCase();

  // Filter links based on search term
  const filteredLinks = links.filter((link) => {
    if (!searchTerm) return true;
    const decodedText = decodeTextFragment(link.textFragment);
    return (
      decodedText.toLowerCase().includes(lowerSearchTerm) ||
      link.targetLink.toLowerCase().includes(lowerSearchTerm)
    );
  });

  if (filteredLinks.length === 0) {
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    emptyState.textContent = searchTerm
      ? 'No links match your search.'
      : 'No links on this page yet.';
    currentPageLinks.appendChild(emptyState);
    return;
  }

  const ul = document.createElement('ul');
  filteredLinks.forEach((link) => {
    const li = document.createElement('li');
    const wrapper = document.createElement('div');
    wrapper.className = 'link-item-wrapper';

    const linkContent = document.createElement('div');
    linkContent.className = 'link-content';

    const a = document.createElement('a');
    a.href = link.targetLink;
    const decodedText = decodeTextFragment(link.textFragment);
    a.textContent = `${decodedText} → ${link.targetLink}`;
    a.target = '_blank';

    linkContent.appendChild(a);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = '🗑️';
    deleteBtn.title = 'Delete link';
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteLink(currentUrl, link);
    });

    wrapper.appendChild(linkContent);
    wrapper.appendChild(deleteBtn);
    li.appendChild(wrapper);
    ul.appendChild(li);
  });
  currentPageLinks.appendChild(ul);
}

// Delete a specific link
function deleteLink(url: string, linkToDelete: Link) {
  chrome.storage.local.get(url, (items) => {
    const links = items[url];
    if (!Array.isArray(links)) return;

    // Filter out the link to delete
    const updatedLinks = links.filter(
      (link) =>
        link.textFragment !== linkToDelete.textFragment ||
        link.targetLink !== linkToDelete.targetLink,
    );

    if (updatedLinks.length === 0) {
      // Remove the entire URL key if no links remain
      chrome.storage.local.remove(url, () => {
        delete allLinksData[url];
        refreshDisplay();
      });
    } else {
      // Update with remaining links
      chrome.storage.local.set({ [url]: updatedLinks }, () => {
        allLinksData[url] = updatedLinks;
        refreshDisplay();
      });
    }
  });
}

// Refresh the display after data changes
function refreshDisplay() {
  const allSearch = document.getElementById('all-search') as HTMLInputElement;
  const currentSearch = document.getElementById(
    'current-search',
  ) as HTMLInputElement;

  renderAllLinks(allSearch?.value || '');
  renderCurrentPageLinks(currentSearch?.value || '');
}

document.addEventListener('DOMContentLoaded', async () => {
  // Tab switching
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabPanes = document.querySelectorAll('.tab-pane');

  tabButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const targetTab = button.getAttribute('data-tab');

      // Remove active class from all buttons and panes
      tabButtons.forEach((btn) => btn.classList.remove('active'));
      tabPanes.forEach((pane) => pane.classList.remove('active'));

      // Add active class to clicked button and corresponding pane
      button.classList.add('active');
      const targetPane = document.getElementById(`${targetTab}-tab`);
      if (targetPane) {
        targetPane.classList.add('active');
      }
    });
  });

  // Get current tab URL
  const [currentTab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });
  currentUrl = currentTab?.url || '';

  // Set up search filters
  const allSearch = document.getElementById('all-search') as HTMLInputElement;
  const currentSearch = document.getElementById(
    'current-search',
  ) as HTMLInputElement;

  if (allSearch) {
    allSearch.addEventListener('input', (e) => {
      const searchTerm = (e.target as HTMLInputElement).value;
      renderAllLinks(searchTerm);
    });
  }

  if (currentSearch) {
    currentSearch.addEventListener('input', (e) => {
      const searchTerm = (e.target as HTMLInputElement).value;
      renderCurrentPageLinks(searchTerm);
    });
  }

  // Load and display all links
  chrome.storage.local.get(null, (items) => {
    allLinksData = items;
    renderAllLinks();
    renderCurrentPageLinks();
  });
});
