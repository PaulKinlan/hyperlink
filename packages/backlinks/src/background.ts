import { Mutex } from 'async-mutex';
import {
  type Backlinks,
  Storage,
} from '@hyperlink-experiments/shared/src/index';

const storage = new Storage();
const mutex = new Mutex();

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'showBacklinks',
    title: 'Show Backlinks for this page',
    contexts: ['page'],
  });
  chrome.contextMenus.create({
    id: 'showBacklinksForLink',
    title: 'Show Backlinks for this link',
    contexts: ['link'],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'showBacklinks') {
    const url = tab.url;
    if (url) {
      const backlinks = (await storage.get(url)) as Backlink[];
      if (backlinks) {
        const backlinkUrls = backlinks.map((b) => b.url);
        chrome.tabs.create({
          url: `data:text/html,
            <h1>Backlinks for ${url}</h1>
            <ul>
              ${backlinkUrls
                .map((b) => `<li><a href="${b}">${b}</a></li>`)
                .join('')}
            </ul>
          `,
        });
      }
    }
  } else if (info.menuItemId === 'showBacklinksForLink') {
    const url = info.linkUrl;
    if (url) {
      const backlinks = (await storage.get(url)) as Backlink[];
      if (backlinks) {
        const backlinkUrls = backlinks.map((b) => b.url);
        chrome.tabs.create({
          url: `data:text/html,
            <h1>Backlinks for ${url}</h1>
            <ul>
              ${backlinkUrls
                .map((b) => `<li><a href="${b}">${b}</a></li>`)
                .join('')}
            </ul>
          `,
        });
      }
    }
  }
});
