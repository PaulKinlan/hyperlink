chrome.tabGroups.onUpdated.addListener(async (tabGroup) => {
  // When a tab is added to a group, this listener is triggered.
  // We can then get all the tabs in the group and update the summary.
  const tabs = await chrome.tabs.query({ groupId: tabGroup.id });
  updateSummary(tabGroup.id, tabs);
});

async function updateSummary(groupId: number, tabs: chrome.tabs.Tab[]) {
  const summaryTab = await findOrCreateSummaryTab(groupId, tabs);
  const summaries = await Promise.all(
    tabs
      .filter((tab) => tab.id !== summaryTab.id) // Exclude the summary tab itself
      .map(getSummary),
  );

  // Send the summaries to the summary tab
  chrome.tabs.sendMessage(summaryTab.id, {
    action: 'updateSummary',
    summaries,
  });
}

async function findOrCreateSummaryTab(
  groupId: number,
  tabs: chrome.tabs.Tab[],
) {
  const summaryTab = tabs.find((tab) => tab.url.includes('summary.html'));
  if (summaryTab) {
    return summaryTab;
  }

  const newTab = await chrome.tabs.create({
    url: 'summary.html',
    index: 0,
  });
  await chrome.tabs.group({
    groupId,
    tabIds: [newTab.id],
  });
  return newTab;
}

async function getSummary(tab: chrome.tabs.Tab): Promise<string> {
  if (!tab.id) {
    return '';
  }
  return new Promise((resolve) => {
    chrome.scripting.executeScript(
      {
        target: { tabId: tab.id },
        files: ['dist/content.js'],
      },
      () => {
        chrome.tabs.sendMessage(
          tab.id,
          { action: 'getMarkdown' },
          (response) => {
            if (chrome.runtime.lastError) {
              console.error(chrome.runtime.lastError);
              resolve('');
            } else {
              // Now we have the markdown, let's summarize it.
              // This part is simplified. In a real extension, you'd use an LLM.
              resolve(response.markdown.substring(0, 200));
            }
          },
        );
      },
    );
  });
}
