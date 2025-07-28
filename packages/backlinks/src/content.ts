import { Mutex } from 'async-mutex';
import {
  type Backlink,
  type Backlinks,
  type Link,
  Storage,
} from '@hyperlink-experiments/shared/src/index';

const storage = new Storage();
const mutex = new Mutex();

async function getPageText() {
  return document.body.innerText;
}

async function getPageTitle() {
  return document.title;
}

async function addBacklink(link: Link, backlink: Backlink) {
  return mutex.runExclusive(async () => {
    const existingBacklinks = (await storage.get(link)) as Backlink[];
    const updatedBacklinks = existingBacklinks || [];
    const backlinkIndex = updatedBacklinks.findIndex(
      (b) => b.url === backlink.url,
    );

    if (backlinkIndex === -1) {
      updatedBacklinks.push(backlink);
    } else {
      const existingBacklink = updatedBacklinks[backlinkIndex];
      updatedBacklinks[backlinkIndex] = {
        ...existingBacklink,
        ...backlink,
      };
    }

    await storage.set(link, updatedBacklinks);
  });
}

async function onPageLoad() {
  const links = Array.from(document.querySelectorAll('a'));
  const pageUrl = window.location.href;
  const pageTitle = await getPageTitle();

  for (const link of links) {
    const href = link.href;
    if (href) {
      addBacklink(href, {
        url: pageUrl,
        title: pageTitle,
        text: link.innerText,
        timestamps: [Date.now()],
      });
    }
  }
}

async function onNavigate() {
  const links = Array.from(document.querySelectorAll('a'));
  for (const link of links) {
    link.addEventListener('click', async () => {
      const href = link.href;
      if (href) {
        const backlinks = (await storage.get(href)) as Backlink[];
        const backlink = backlinks?.find((b) => b.url === window.location.href);
        if (backlink) {
          addBacklink(href, {
            ...backlink,
            ...(backlink.navigations
              ? { navigations: [...backlink.navigations, Date.now()] }
              : { navigations: [Date.now()] }),
          });
        }
      }
    });
  }
}

onPageLoad();
onNavigate();
