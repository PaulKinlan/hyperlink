let selectedText = '';

document.addEventListener('selectionchange', () => {
  const selection = window.getSelection();
  if (selection) {
    selectedText = selection.toString();
  }
});

document.addEventListener('wheel', (event) => {
  if (event.ctrlKey && selectedText) {
    event.preventDefault();
    const action = event.deltaY < 0 ? 'expand' : 'summarize';
    chrome.runtime.sendMessage({
      action,
      text: selectedText,
    });
  }
});

chrome.runtime.onMessage.addListener((request) => {
  if (request.action === 'replace') {
    const selection = window.getSelection();
    if (selection) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(request.text));
    }
  }
});
