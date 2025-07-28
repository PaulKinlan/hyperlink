chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'memex-trail-join',
    title: 'Create Trail',
    contexts: ['selection'],
  });
});

chrome.commands.onCommand.addListener(async (command) => {
  console.log(`Command: ${command}`);
  if (command === 'create-link') {
    await chrome.action.setPopup({
      popup: 'create-link.html',
    });
    await chrome.action.openPopup();
  }
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'memex-trail-join') {
    await chrome.action.setPopup({
      popup: 'create-link.html',
    });
    await chrome.action.openPopup();
  }
});
