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
  return match ? match[1] : markdown; // If no code block, return as-is
};

// Create and show loading indicator
function showLoadingIndicator(element: HTMLElement): HTMLElement {
  const loader = document.createElement('div');
  loader.style.cssText = `
    display: inline-block;
    margin-left: 10px;
    padding: 5px 10px;
    background: rgba(33, 150, 243, 0.1);
    border: 1px solid #2196f3;
    border-radius: 4px;
    font-size: 12px;
    color: #2196f3;
    font-family: sans-serif;
    animation: pulse 1.5s ease-in-out infinite;
  `;
  loader.textContent = '⏳ Merging content...';

  // Add animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  `;
  document.head.appendChild(style);

  element.parentElement?.insertBefore(loader, element.nextSibling);
  return loader;
}

// Show notification
function showNotification(message: string, type: 'success' | 'error' | 'info') {
  const notification = document.createElement('div');
  const colors = {
    success: { bg: '#4caf50', border: '#388e3c' },
    error: { bg: '#f44336', border: '#d32f2f' },
    info: { bg: '#2196f3', border: '#1976d2' },
  };

  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    background: ${colors[type].bg};
    color: white;
    border-left: 4px solid ${colors[type].border};
    border-radius: 4px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    font-family: sans-serif;
    font-size: 14px;
    z-index: 10000;
    max-width: 400px;
    animation: slideIn 0.3s ease-out;
  `;
  notification.textContent = message;

  // Add animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);

  document.body.appendChild(notification);

  setTimeout(
    () => {
      notification.style.animation = 'slideIn 0.3s ease-out reverse';
      setTimeout(() => notification.remove(), 300);
    },
    type === 'error' ? 5000 : 3000,
  );
}

// Helper function to perform merge on a link
async function performMerge(link: HTMLAnchorElement): Promise<void> {
  if (!link.href) {
    showNotification('Invalid link', 'error');
    return;
  }

  if (link.parentElement === null) {
    console.error('Parent element is null, cannot merge content.');
    showNotification('Cannot merge: Invalid element structure', 'error');
    return;
  }

  const parentElement = link.parentElement;
  const loader = showLoadingIndicator(link);

  try {
    // Get markdown from linked page
    const targetMarkdown = await chrome.runtime.sendMessage({
      action: 'openLinkForMarkdown',
      url: link.href,
    });

    if (targetMarkdown.error) {
      throw new Error(targetMarkdown.error);
    }

    const parentHtml = parentElement?.innerHTML || '';
    const localMarkdown = turndownService.turndown(parentHtml);

    console.log('Markdown from link:', targetMarkdown.markdown);
    console.log('Local markdown:', localMarkdown);

    // Merge content
    const mergedHtml = await chrome.runtime.sendMessage({
      action: 'merge',
      targetHref: link.href,
      targetWindow: targetMarkdown.markdown,
      localHTML: parentHtml,
      localMarkdown,
    });

    if (mergedHtml.action === 'mergeError') {
      throw new Error(mergedHtml.error);
    }

    console.log('Merged HTML:', mergedHtml);
    const html = extractHTMLFromMarkdown(mergedHtml.content);
    parentElement.innerHTML = html;

    showNotification('✓ Content merged successfully!', 'success');
  } catch (error) {
    console.error('Merge failed:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to merge content';
    showNotification(`✗ ${errorMessage}`, 'error');
  } finally {
    loader.remove();
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Received request:', request);

  if (request.action === 'mergeFromContextMenu') {
    // Handle context menu merge request
    const linkUrl = request.linkUrl;
    // Find the link element with this URL
    const links = document.querySelectorAll<HTMLAnchorElement>('a[href]');
    const link = Array.from(links).find((l) => l.href === linkUrl);

    if (link) {
      performMerge(link);
    } else {
      showNotification('Could not find link on page', 'error');
    }
    sendResponse({ success: true });
    return true;
  }

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
  return true;
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

    await performMerge(link);
  }
});
