interface TabData {
  url?: string;
  title?: string;
}

interface HistoryItem {
  url?: string;
  title?: string;
}

interface BookmarkNode {
  url?: string;
  title?: string;
  children?: BookmarkNode[];
}

interface LinkData {
  textFragment: string;
  targetLink: string;
}

// Store original data for filtering
let allTabs: TabData[] = [];
let allHistory: HistoryItem[] = [];
let allBookmarks: { url: string; title: string }[] = [];
let allLinks: { url: string; link: LinkData }[] = [];

const createLinkHandler = async (event: Event) => {
  event.preventDefault();

  const targetLink = (event.target as HTMLAnchorElement).href;
  const currentTab = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });
  if (currentTab.length === 0) {
    console.error('No active tab found');
    return;
  }

  const { selectedText, context } = await chrome.tabs.sendMessage(
    currentTab[0].id!,
    {
      action: 'getSelectedText',
    },
  );

  if (!selectedText) {
    console.error('No text selected');
    return;
  }

  // Build context-aware text fragment
  let fragmentText = '';
  if (context?.prefix && context?.suffix) {
    fragmentText = `${encodeURIComponent(context.prefix).replace(/-/g, '%2D')}-,${encodeURIComponent(selectedText).replace(/-/g, '%2D')},-${encodeURIComponent(context.suffix).replace(/-/g, '%2D')}`;
  } else if (context?.prefix) {
    fragmentText = `${encodeURIComponent(context.prefix).replace(/-/g, '%2D')}-,${encodeURIComponent(selectedText).replace(/-/g, '%2D')}`;
  } else if (context?.suffix) {
    fragmentText = `${encodeURIComponent(selectedText).replace(/-/g, '%2D')},-${encodeURIComponent(context.suffix).replace(/-/g, '%2D')}`;
  } else {
    fragmentText = encodeURIComponent(selectedText).replace(/-/g, '%2D');
  }

  const { status } = await chrome.tabs.sendMessage(currentTab[0].id!, {
    action: 'createLink',
    textFragment: `#:~:text=${fragmentText}`,
    targetLink,
  });

  if (status === 'success') {
    console.log('Link created successfully');
    window.close();
  }
};

// Render tabs with optional search filter
const renderTabs = (searchTerm: string = '') => {
  const tabsList = document.getElementById('tabs-list');
  if (!tabsList) return;

  tabsList.innerHTML = '';

  const lowerSearchTerm = searchTerm.toLowerCase();
  const filteredTabs = allTabs.filter((tab) => {
    if (!searchTerm) return true;
    return (
      (tab.title && tab.title.toLowerCase().includes(lowerSearchTerm)) ||
      (tab.url && tab.url.toLowerCase().includes(lowerSearchTerm))
    );
  });

  filteredTabs.forEach((tab) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = tab.url || '';
    a.textContent = tab.title || tab.url || '';
    a.target = '_blank';
    a.addEventListener('click', createLinkHandler);
    li.appendChild(a);
    tabsList.appendChild(li);
  });

  if (filteredTabs.length === 0) {
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    emptyState.textContent = searchTerm
      ? 'No tabs match your search.'
      : 'No open tabs found.';
    tabsList.appendChild(emptyState);
  }
};

// Render history with optional search filter
const renderHistory = (searchTerm: string = '') => {
  const historyList = document.getElementById('history-list');
  if (!historyList) return;

  historyList.innerHTML = '';

  const lowerSearchTerm = searchTerm.toLowerCase();
  const filteredHistory = allHistory.filter((item) => {
    if (!searchTerm) return true;
    return (
      (item.title && item.title.toLowerCase().includes(lowerSearchTerm)) ||
      (item.url && item.url.toLowerCase().includes(lowerSearchTerm))
    );
  });

  filteredHistory.forEach((item) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = item.url || '';
    a.textContent = item.title || item.url || '';
    a.target = '_blank';
    a.addEventListener('click', createLinkHandler);
    li.appendChild(a);
    historyList.appendChild(li);
  });

  if (filteredHistory.length === 0) {
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    emptyState.textContent = searchTerm
      ? 'No history items match your search.'
      : 'No history found.';
    historyList.appendChild(emptyState);
  }
};

// Render bookmarks with optional search filter
const renderBookmarks = (searchTerm: string = '') => {
  const bookmarksList = document.getElementById('bookmarks-list');
  if (!bookmarksList) return;

  bookmarksList.innerHTML = '';

  const lowerSearchTerm = searchTerm.toLowerCase();
  const filteredBookmarks = allBookmarks.filter((bookmark) => {
    if (!searchTerm) return true;
    return (
      bookmark.title.toLowerCase().includes(lowerSearchTerm) ||
      bookmark.url.toLowerCase().includes(lowerSearchTerm)
    );
  });

  filteredBookmarks.forEach((bookmark) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = bookmark.url;
    a.textContent = bookmark.title || bookmark.url;
    a.target = '_blank';
    a.addEventListener('click', createLinkHandler);
    li.appendChild(a);
    bookmarksList.appendChild(li);
  });

  if (filteredBookmarks.length === 0) {
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    emptyState.textContent = searchTerm
      ? 'No bookmarks match your search.'
      : 'No bookmarks found.';
    bookmarksList.appendChild(emptyState);
  }
};

// Render links with optional search filter
const renderLinks = (searchTerm: string = '') => {
  const linksList = document.getElementById('links-list');
  if (!linksList) return;

  linksList.innerHTML = '';

  const lowerSearchTerm = searchTerm.toLowerCase();
  const filteredLinks = allLinks.filter((item) => {
    if (!searchTerm) return true;
    return (
      item.link.targetLink.toLowerCase().includes(lowerSearchTerm) ||
      item.url.toLowerCase().includes(lowerSearchTerm)
    );
  });

  filteredLinks.forEach((item) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = item.link.targetLink;
    a.textContent = item.link.targetLink;
    a.target = '_blank';
    a.addEventListener('click', createLinkHandler);
    li.appendChild(a);
    linksList.appendChild(li);
  });

  if (filteredLinks.length === 0) {
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    emptyState.textContent = searchTerm
      ? 'No links match your search.'
      : 'No links found.';
    linksList.appendChild(emptyState);
  }
};

// Load initial data
const loadTabs = async () => {
  const tabs = await chrome.tabs.query({});
  allTabs = tabs.map((tab) => ({
    url: tab.url,
    title: tab.title,
  }));
  renderTabs();
};

const loadHistory = () => {
  chrome.history.search({ text: '', maxResults: 100 }, (historyItems) => {
    allHistory = historyItems;
    renderHistory();
  });
};

const loadBookmarks = () => {
  chrome.bookmarks.getTree((bookmarks) => {
    allBookmarks = [];
    const traverseBookmarks = (nodes: BookmarkNode[]) => {
      nodes.forEach((node) => {
        if (node.url) {
          allBookmarks.push({
            url: node.url,
            title: node.title || node.url,
          });
        } else if (node.children) {
          traverseBookmarks(node.children);
        }
      });
    };
    traverseBookmarks(bookmarks);
    renderBookmarks();
  });
};

const loadLinks = () => {
  chrome.storage.local.get(null, (items) => {
    allLinks = [];
    for (const url in items) {
      const links = items[url];
      if (Array.isArray(links)) {
        links.forEach((link) => {
          allLinks.push({ url, link });
        });
      }
    }
    renderLinks();
  });
};

document.addEventListener('DOMContentLoaded', () => {
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

  // Set up search filters
  const tabsSearch = document.getElementById('tabs-search') as HTMLInputElement;
  const historySearch = document.getElementById(
    'history-search',
  ) as HTMLInputElement;
  const bookmarksSearch = document.getElementById(
    'bookmarks-search',
  ) as HTMLInputElement;
  const linksSearch = document.getElementById(
    'links-search',
  ) as HTMLInputElement;

  if (tabsSearch) {
    tabsSearch.addEventListener('input', (e) => {
      const searchTerm = (e.target as HTMLInputElement).value;
      renderTabs(searchTerm);
    });
  }

  if (historySearch) {
    historySearch.addEventListener('input', (e) => {
      const searchTerm = (e.target as HTMLInputElement).value;
      renderHistory(searchTerm);
    });
  }

  if (bookmarksSearch) {
    bookmarksSearch.addEventListener('input', (e) => {
      const searchTerm = (e.target as HTMLInputElement).value;
      renderBookmarks(searchTerm);
    });
  }

  if (linksSearch) {
    linksSearch.addEventListener('input', (e) => {
      const searchTerm = (e.target as HTMLInputElement).value;
      renderLinks(searchTerm);
    });
  }

  // Load all data
  loadTabs();
  loadHistory();
  loadBookmarks();
  loadLinks();
});
