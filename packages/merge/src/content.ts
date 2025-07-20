import { parseHTML } from 'linkedom';
import TurndownService from 'turndown';
const turndownService = new TurndownService();

turndownService.addRule('no-style', {
  filter: ['style', 'script', 'footer', 'iframe', 'head', 'img', 'input'],
  replacement: function (content) {
    return '';
  },
});

turndownService.addRule('no-link', {
  filter: ['a'],
  replacement: function (content) {
    return content;
  },
});

/*
 * Extracts HTML from a markdown code block.
 * @param {string} markdown - The markdown content.
 * @returns {string} - The HTML content extracted from the markdown.
 * @example
 * const markdown = "Here is some text.\n\n```html\n<p>This is a paragraph.</p>\n```\n\nMore text.";
 * const html = extractHTMLFromMarkdownCode(markdown);
 * console.log(html); // Outputs: <p>This is a paragraph.</p>
 */
const extractHTMLFromMarkdown = (markdown: string) => {
  const match = markdown.match(/```html\n([\s\S]*?)\n```/);
  return match ? match[1] : '';
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Received request:', request);
  if (request.action === 'getMarkdown') {
    const hash = window.location.hash;
    let content;
    if (hash) {
      const element = document.querySelector(hash);
      if (element) {
        content = element.parentElement?.outerHTML || '';
      } else {
        console.error(`Element with hash ${hash} not found.`);
        content = '';
      }
    } else {
      content = document.body.innerHTML;
    }
    const markdown = turndownService.turndown(content);
    console.log('Generated markdown:', markdown);
    sendResponse({ markdown });
  }
});

document.addEventListener('click', async (e) => {
  if (e.shiftKey || e.ctrlKey) {
    e.preventDefault();
    e.stopPropagation();
    const target = e.target as HTMLElement;
    const link = target.closest('a');
    if (!link || !link.href) {
      return;
    }

    if (link.parentElement === null) {
      console.error('Parent element is null, cannot merge content.');
      return;
    }

    const targetMarkdown = await chrome.runtime.sendMessage({
      action: 'openLinkForMarkdown',
      url: link.href,
    });

    const parentElement = link.parentElement;
    const parentHtml = parentElement?.innerHTML || '';
    const localMarkdown = turndownService.turndown(parentHtml);

    console.log('Markdown from link:', targetMarkdown.markdown);
    console.log('Local markdown:', localMarkdown);

    const mergedHtml = await chrome.runtime.sendMessage({
      action: 'merge',
      targetHref: link.href,
      targetWindow: targetMarkdown.markdown,
      localHTML: parentHtml,
      localMarkdown,
    });

    console.log('Merged HTML:', mergedHtml);
    const html = extractHTMLFromMarkdown(mergedHtml.content);
    encodeURIComponent(html);
    parentElement.innerHTML = html;
  }
});
