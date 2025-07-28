const createLinks = async (
  createLinkHandler: (event: any) => Promise<void>,
) => {
  const linksList = document.getElementById('links-list');
  chrome.storage.local.get(null, (items) => {
    const ul = document.createElement('ul');
    linksList.appendChild(ul);
    for (const url in items) {
      const links = items[url];
      if (Array.isArray(links)) {
        links.forEach((link) => {
          const li = document.createElement('li');
          const a = document.createElement('a');
          a.href = link.targetLink;
          a.textContent = `${link.targetLink}`;
          a.target = '_blank';

          a.addEventListener('click', createLinkHandler);
          li.appendChild(a);
          ul.appendChild(li);
        });
      }
    }
  });
};

const createLinksFromHistory = async (
  createLinkHandler: (event: any) => Promise<void>,
) => {
  const historyList = document.getElementById('history-list');
  chrome.history.search({ text: '', maxResults: 10 }, (historyItems) => {
    historyItems.forEach((item) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = item.url;
      a.textContent = item.title || item.url;

      a.addEventListener('click', createLinkHandler);
      a.target = '_blank';
      li.appendChild(a);
      historyList.appendChild(li);
    });
  });
};

const createLinksFromBookmarks = async (
  createLinkHandler: (event: any) => Promise<void>,
) => {
  const bookmarksList = document.getElementById('bookmarks-list');
  chrome.bookmarks.getTree((bookmarks) => {
    const traverseBookmarks = (nodes) => {
      nodes.forEach((node) => {
        if (node.url) {
          const li = document.createElement('li');
          const a = document.createElement('a');
          a.href = node.url;
          a.textContent = node.title || node.url;
          a.target = '_blank';

          a.addEventListener('click', createLinkHandler);
          li.appendChild(a);
          bookmarksList.appendChild(li);
        } else if (node.children) {
          const ul = document.createElement('ul');
          traverseBookmarks(node.children);
          bookmarksList.appendChild(ul);
        }
      });
    };
    traverseBookmarks(bookmarks);
  });
};

const createLinksFromTabs = async (
  createLinkHandler: (event: any) => Promise<void>,
) => {
  const tabsList = document.getElementById('tabs-list');
  const tabs = await chrome.tabs.query({});

  tabs.forEach((tab) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = tab.url;
    a.textContent = tab.title || tab.url;
    a.target = '_blank';
    a.addEventListener('click', createLinkHandler);
    li.appendChild(a);
    tabsList.appendChild(li);
  });
};

document.addEventListener('DOMContentLoaded', () => {
  const createLinkHandler = async (event) => {
    event.preventDefault();

    const targetLink = event.target.href;
    const currentTab = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (currentTab.length === 0) {
      console.error('No active tab found');
      return;
    }

    const { selectedText } = await chrome.tabs.sendMessage(currentTab[0].id, {
      action: 'getSelectedText',
    });
    if (!selectedText) {
      console.error('No text selected');
      return;
    }

    const response = await chrome.tabs.sendMessage(currentTab[0].id, {
      action: 'createLink',
      textFragment: `#:~:text=${encodeURIComponent(selectedText)}`,
      targetLink,
    });

    if (response.status === 'success') {
      console.log('Link created successfully');
      window.close();
    }
  };

  createLinks(createLinkHandler);
  createLinksFromHistory(createLinkHandler);
  createLinksFromBookmarks(createLinkHandler);
  createLinksFromTabs(createLinkHandler);
});
