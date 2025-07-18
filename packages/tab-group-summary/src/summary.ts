import { marked } from 'marked';

chrome.runtime.onMessage.addListener((request) => {
  const container = document.getElementById('summary-container');
  if (!container) {
    return;
  }

  if (request.action === 'updateSummary') {
    container.innerHTML = '';
  }

  if (request.action === 'addSummary') {
    const { summary, url, title, tabId, screenshot } = request;

    const summaryItem = document.createElement('div');
    summaryItem.className = 'summary-item';

    const heading = document.createElement('h2');
    const link = document.createElement('a');
    link.textContent = title;
    link.href = url;
    link.addEventListener('click', (e) => {
      e.preventDefault();
      chrome.tabs.update(tabId, { active: true });
      chrome.windows.update(chrome.windows.WINDOW_ID_CURRENT, {
        focused: true,
      });
    });
    heading.appendChild(link);

    const contentContainer = document.createElement('div');
    contentContainer.className = 'content-container';

    const summaryContent = document.createElement('div');
    summaryContent.className = 'summary-content';
    Promise.resolve(marked.parse(summary)).then((html) => {
      summaryContent.innerHTML = html;
    });

    const screenshotContainer = document.createElement('div');
    screenshotContainer.className = 'screenshot-container';
    const screenshotImg = document.createElement('img');
    screenshotImg.src = screenshot;
    screenshotContainer.appendChild(screenshotImg);

    contentContainer.appendChild(summaryContent);
    contentContainer.appendChild(screenshotContainer);

    summaryItem.appendChild(heading);
    summaryItem.appendChild(contentContainer);

    container.appendChild(summaryItem);
  }
});
