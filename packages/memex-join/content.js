function createLink(textFragment, targetLink) {
  const url = window.location.href;
  chrome.storage.local.get([url], (result) => {
    const links = result[url] || [];
    links.push({ textFragment, targetLink });
    chrome.storage.local.set({ [url]: links }, () => {
      // After saving, highlight the new link
      const decodedFragment = decodeURIComponent(textFragment.replace('#:~:text=', ''));
      const range = document.createRange();
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        range.setStart(selection.anchorNode, selection.anchorOffset);
        range.setEnd(selection.focusNode, selection.focusOffset);
        const a = document.createElement('a');
        a.href = targetLink;
        a.style.backgroundColor = 'yellow'; // Highlight the link
        range.surroundContents(a);
      }
    });
  });
}

window.addEventListener('load', () => {
  const url = window.location.href;
  chrome.storage.local.get([url], (result) => {
    const links = result[url] || [];
    links.forEach(link => {
      const { textFragment, targetLink } = link;
      const decodedFragment = decodeURIComponent(textFragment.replace('#:~:text=', ''));
      const range = document.createRange();
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let node;
      while (node = walker.nextNode()) {
        const index = node.nodeValue.indexOf(decodedFragment);
        if (index !== -1) {
          range.setStart(node, index);
          range.setEnd(node, index + decodedFragment.length);
          const a = document.createElement('a');
          a.href = targetLink;
          a.style.backgroundColor = 'yellow'; // Highlight the link
          range.surroundContents(a);
          break; // Stop after finding the first match
        }
      }
    });
  });
});

document.addEventListener('paste', (event) => {
  const selection = window.getSelection();
  if (!selection.isCollapsed) {
    const selectedText = selection.toString();
    const pastedData = (event.clipboardData || window.clipboardData).getData('text');
    try {
      new URL(pastedData);
      event.preventDefault();
      const textFragment = `#:~:text=${encodeURIComponent(selectedText)}`;
      createLink(textFragment, pastedData);
    } catch (_) {
      // Pasted data is not a valid URL, do nothing
    }
  }
});
