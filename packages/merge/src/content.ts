let targetElement: HTMLElement | null = null;

document.addEventListener('click', (e) => {
  if (e.ctrlKey || e.altKey) {
    const target = e.target as HTMLElement;
    const anchor = target.closest('a');
    if (anchor && anchor.parentElement) {
      e.preventDefault();
      targetElement = anchor.parentElement;
      chrome.runtime.sendMessage({
        action: 'merge',
        url: anchor.href,
        parent: anchor.parentElement.outerHTML,
      });
    }
  }
});

chrome.runtime.onMessage.addListener((request) => {
  if (request.action === 'mergedContent' && targetElement) {
    const { content } = request;
    targetElement.innerHTML = content;
    targetElement = null;
  }
});
