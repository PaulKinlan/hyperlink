let selectedText = '';
let originalText = '';
let zoomLevel = 0;
let textFragment = '';

window.addEventListener('load', () => {
  const url = window.location.href;
  chrome.storage.local.get(url, (data) => {
    const pageData = data[url];
    if (pageData) {
      for (const fragment in pageData) {
        const zoomLevels = pageData[fragment];
        const lastZoom = Object.keys(zoomLevels).sort().pop();
        if (lastZoom !== '0') {
          const textToReplace = decodeURIComponent(fragment.split('=')[1]);
          const replacementText = zoomLevels[lastZoom];
          replaceTextOnPage(textToReplace, replacementText);
        }
      }
    }
  });
});

document.addEventListener('selectionchange', () => {
  const selection = window.getSelection();
  if (selection && selection.rangeCount > 0) {
    selectedText = selection.toString();
    const range = selection.getRangeAt(0);
    const commonAncestor = range.commonAncestorContainer;
    const element =
      commonAncestor.nodeType === 1
        ? commonAncestor
        : commonAncestor.parentElement;

    if (element) {
      const newTextFragment = `#:~:text=${encodeURIComponent(
        element.textContent || '',
      )}`;
      if (newTextFragment !== textFragment) {
        originalText = element.textContent || '';
        zoomLevel = 0;
        textFragment = newTextFragment;
      }
    }
  }
});

document.addEventListener('wheel', (event) => {
  if (event.ctrlKey && selectedText) {
    event.preventDefault();
    const direction = event.deltaY < 0 ? 1 : -1;
    const newZoomLevel = zoomLevel + direction;
    const url = window.location.href;

    chrome.storage.local.get(url, (data) => {
      const pageData = data[url] || {};
      const textData = pageData[textFragment] || {};

      if (textData[newZoomLevel]) {
        replaceText(textData[newZoomLevel]);
        zoomLevel = newZoomLevel;
      } else {
        const action = direction > 0 ? 'expand' : 'summarize';
        chrome.runtime.sendMessage({
          action,
          text: selectedText,
          url,
          textFragment,
          zoomLevel: newZoomLevel,
        });
      }
    });
  }
});

chrome.runtime.onMessage.addListener((request) => {
  if (request.action === 'replace') {
    const url = request.url;
    chrome.storage.local.get(url, (data) => {
      const pageData = data[url] || {};
      const textData = pageData[request.textFragment] || { '0': originalText };
      textData[request.zoomLevel] = request.text;
      pageData[request.textFragment] = textData;
      chrome.storage.local.set({ [url]: pageData });
      replaceText(request.text);
      zoomLevel = request.zoomLevel;
    });
  }
});

function replaceText(text) {
  const selection = window.getSelection();
  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const commonAncestor = range.commonAncestorContainer;

    const element =
      commonAncestor.nodeType === 1
        ? commonAncestor
        : commonAncestor.parentElement;
    if (element) {
      element.innerHTML = text;
      selectedText = text;
    }
  }
}

function replaceTextOnPage(find, replace) {
  const elements = document.getElementsByTagName('*');
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    for (let j = 0; j < element.childNodes.length; j++) {
      const node = element.childNodes[j];
      if (node.nodeType === 3) {
        const text = node.nodeValue;
        const replacedText = text.replace(find, replace);
        if (replacedText !== text) {
          element.replaceChild(document.createTextNode(replacedText), node);
        }
      }
    }
  }
}
