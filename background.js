chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "memex-trail-join",
    title: "Create Trail",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "memex-trail-join") {
    const selectedText = info.selectionText;
    const targetLink = prompt("Enter the target link:");
    if (targetLink) {
      const url = tab.url;
      const textFragment = `#:~:text=${encodeURIComponent(selectedText)}`;
      chrome.storage.local.get([url], (result) => {
        const links = result[url] || [];
        links.push({ textFragment, targetLink });
        chrome.storage.local.set({ [url]: links });
      });
    }
  }
});
