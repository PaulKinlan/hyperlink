function getSurroundingContext(selectedText: string): {
  prefix: string;
  suffix: string;
} {
  const selection = window.getSelection();
  if (!selection || !selection.rangeCount) {
    return { prefix: '', suffix: '' };
  }

  const range = selection.getRangeAt(0);
  const container = range.commonAncestorContainer;
  const textContent = container.textContent || '';
  const selectedIndex = textContent.indexOf(selectedText);

  if (selectedIndex === -1) {
    return { prefix: '', suffix: '' };
  }

  // Extract up to 20 characters before and after
  const prefixStart = Math.max(0, selectedIndex - 20);
  const prefixText = textContent.substring(prefixStart, selectedIndex).trim();
  const suffixEnd = Math.min(
    textContent.length,
    selectedIndex + selectedText.length + 20,
  );
  const suffixText = textContent
    .substring(selectedIndex + selectedText.length, suffixEnd)
    .trim();

  // Get the last few words of prefix and first few words of suffix
  const prefixWords = prefixText.split(/\s+/).slice(-3).join(' ');
  const suffixWords = suffixText.split(/\s+/).slice(0, 3).join(' ');

  return {
    prefix: prefixWords,
    suffix: suffixWords,
  };
}

async function createLink(
  textFragment: string,
  targetLink: string,
): Promise<string> {
  const url = window.location.href;
  const result = await chrome.storage.local.get([url]);

  const links = result[url] || [];
  links.push({ textFragment, targetLink });
  await chrome.storage.local.set({ [url]: links });

  const range = document.createRange();
  const selection = window.getSelection();
  if (!selection) return 'failure';
  if (selection.rangeCount > 0) {
    const anchorNode = selection.anchorNode;
    const focusNode = selection.focusNode;
    if (!anchorNode || !focusNode) return 'failure';

    range.setStart(anchorNode, selection.anchorOffset);
    range.setEnd(focusNode, selection.focusOffset);
    const a = document.createElement('a');
    a.href = targetLink;
    a.style.backgroundColor = 'yellow'; // Highlight the link
    range.surroundContents(a);
    return 'success';
  }
  return 'failure';
}

// Text Fragment Matching - Spec Compliant Implementation
// Based on: https://wicg.github.io/scroll-to-text-fragment/

interface ParsedTextDirective {
  prefix: string | null;
  start: string;
  end: string | null;
  suffix: string | null;
}

// Parse text directive following spec format: [prefix-,]start[,end][,-suffix]
function parseTextDirective(textFragment: string): ParsedTextDirective | null {
  // Remove #:~:text= prefix
  let fragment = textFragment.replace(/^#:~:text=/, '');
  if (!fragment) return null;

  let prefix: string | null = null;
  let suffix: string | null = null;
  let start: string;
  let end: string | null = null;

  // Check for prefix (ends with -,)
  if (fragment.includes('-,')) {
    const prefixMatch = fragment.match(/^(.+?)-,/);
    if (prefixMatch) {
      prefix = decodeURIComponent(prefixMatch[1].replace(/%2D/g, '-'));
      fragment = fragment.slice(prefixMatch[0].length);
    }
  }

  // Check for suffix (starts with ,-)
  if (fragment.includes(',-')) {
    const suffixMatch = fragment.match(/,-(.+)$/);
    if (suffixMatch) {
      suffix = decodeURIComponent(suffixMatch[1].replace(/%2D/g, '-'));
      fragment = fragment.slice(0, -suffixMatch[0].length);
    }
  }

  // Parse start and optional end
  const parts = fragment.split(',');
  if (parts.length === 0 || !parts[0]) return null;

  start = decodeURIComponent(parts[0].replace(/%2D/g, '-'));
  if (parts.length > 1 && parts[1]) {
    end = decodeURIComponent(parts[1].replace(/%2D/g, '-'));
  }

  return { prefix, start, end, suffix };
}

// Check if an element has block-level display
function hasBlockDisplay(element: Element): boolean {
  const display = window.getComputedStyle(element).display;
  return ['block', 'table', 'flow-root', 'grid', 'flex', 'list-item'].includes(
    display,
  );
}

// Check if a node is visible and searchable
function isSearchableNode(node: Node): boolean {
  if (node.nodeType !== Node.TEXT_NODE) return false;
  if (!node.parentElement) return false;

  const parent = node.parentElement;
  const tagName = parent.tagName?.toLowerCase();

  // Skip non-searchable elements
  if (
    [
      'script',
      'style',
      'noscript',
      'iframe',
      'object',
      'embed',
      'svg',
      'math',
    ].includes(tagName)
  ) {
    return false;
  }

  // Check visibility
  const style = window.getComputedStyle(parent);
  if (style.display === 'none' || style.visibility === 'hidden') {
    return false;
  }

  return true;
}

// Get nearest block-level ancestor
function getBlockAncestor(node: Node): Element {
  let current = node.parentElement;
  while (current && current !== document.documentElement) {
    if (hasBlockDisplay(current)) {
      return current;
    }
    current = current.parentElement;
  }
  return document.body;
}

// Case-insensitive base character comparison (ignores accents/case)
function compareTextCaseInsensitive(a: string, b: string): boolean {
  return (
    a.localeCompare(b, undefined, { sensitivity: 'base', usage: 'search' }) ===
    0
  );
}

// Check if position is at a word boundary
function isWordBoundary(text: string, position: number): boolean {
  if (position <= 0 || position >= text.length) return true;

  const before = text[position - 1];
  const after = text[position];

  // Unicode word characters: letters, numbers, underscore
  const isWordChar = (char: string) => /[\p{L}\p{N}_]/u.test(char);

  const beforeIsWord = isWordChar(before);
  const afterIsWord = isWordChar(after);

  // Boundary is when transitioning between word and non-word characters
  return beforeIsWord !== afterIsWord;
}

// Find text in the document following spec algorithm
function findTextFragmentInDocument(
  directive: ParsedTextDirective,
): Range | null {
  const blocks = document.querySelectorAll('*');
  const searchedBlocks = new Set<Element>();

  for (const block of Array.from(blocks)) {
    if (!hasBlockDisplay(block)) continue;
    if (searchedBlocks.has(block)) continue;

    searchedBlocks.add(block);

    // Collect visible text nodes in this block
    const textNodes: Text[] = [];
    const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => {
        // Don't traverse into nested blocks
        if (
          node.parentElement &&
          node.parentElement !== block &&
          hasBlockDisplay(node.parentElement)
        ) {
          return NodeFilter.FILTER_REJECT;
        }
        return isSearchableNode(node)
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_SKIP;
      },
    });

    let node;
    while ((node = walker.nextNode())) {
      textNodes.push(node as Text);
    }

    if (textNodes.length === 0) continue;

    // Concatenate text content
    const fullText = textNodes.map((n) => n.textContent || '').join('');

    // Try to find match in this block
    const match = findMatchInText(
      fullText,
      directive.prefix,
      directive.start,
      directive.end,
      directive.suffix,
    );

    if (match) {
      // Convert string positions back to Range
      const range = createRangeFromMatch(textNodes, match.start, match.end);
      if (range) return range;
    }
  }

  return null;
}

interface TextMatch {
  start: number;
  end: number;
}

// Find match in concatenated text with prefix/suffix checking
function findMatchInText(
  text: string,
  prefix: string | null,
  start: string,
  end: string | null,
  suffix: string | null,
): TextMatch | null {
  let searchPos = 0;

  while (searchPos < text.length) {
    // Find start text
    const startIndex = findCaseInsensitive(text, start, searchPos);
    if (startIndex === -1) return null;

    // Check prefix if provided
    if (prefix) {
      const prefixIndex = findCaseInsensitive(
        text,
        prefix,
        Math.max(0, startIndex - prefix.length - 20),
      );
      if (prefixIndex === -1 || prefixIndex >= startIndex) {
        searchPos = startIndex + 1;
        continue;
      }

      // Check that prefix is followed by start with only whitespace between
      const between = text.slice(prefixIndex + prefix.length, startIndex);
      if (!/^\s*$/.test(between)) {
        searchPos = startIndex + 1;
        continue;
      }

      // Check word boundary before start
      if (!isWordBoundary(text, startIndex)) {
        searchPos = startIndex + 1;
        continue;
      }
    } else {
      // No prefix: check word boundary at start
      if (!isWordBoundary(text, startIndex)) {
        searchPos = startIndex + 1;
        continue;
      }
    }

    let endIndex: number;

    if (end) {
      // Range match: find end text
      const endSearchStart = startIndex + start.length;
      const foundEndIndex = findCaseInsensitive(text, end, endSearchStart);
      if (foundEndIndex === -1) return null;
      endIndex = foundEndIndex + end.length;
    } else {
      // Exact match
      endIndex = startIndex + start.length;
    }

    // Check suffix if provided
    if (suffix) {
      const suffixSearchStart = endIndex;
      const suffixIndex = findCaseInsensitive(text, suffix, suffixSearchStart);
      if (suffixIndex === -1 || suffixIndex > endIndex + 20) {
        searchPos = startIndex + 1;
        continue;
      }

      // Check that end is followed by suffix with only whitespace between
      const between = text.slice(endIndex, suffixIndex);
      if (!/^\s*$/.test(between)) {
        searchPos = startIndex + 1;
        continue;
      }

      // Check word boundary after end
      if (!isWordBoundary(text, endIndex)) {
        searchPos = startIndex + 1;
        continue;
      }
    } else {
      // No suffix: check word boundary at end
      if (!isWordBoundary(text, endIndex)) {
        searchPos = startIndex + 1;
        continue;
      }
    }

    // Found a match!
    return { start: startIndex, end: endIndex };
  }

  return null;
}

// Case-insensitive indexOf
function findCaseInsensitive(
  text: string,
  search: string,
  fromIndex: number = 0,
): number {
  const lowerText = text.toLowerCase();
  const lowerSearch = search.toLowerCase();
  return lowerText.indexOf(lowerSearch, fromIndex);
}

// Convert character positions to Range
function createRangeFromMatch(
  textNodes: Text[],
  startPos: number,
  endPos: number,
): Range | null {
  let currentPos = 0;
  let startNode: Text | null = null;
  let startOffset = 0;
  let endNode: Text | null = null;
  let endOffset = 0;

  for (const node of textNodes) {
    const nodeLength = (node.textContent || '').length;

    if (!startNode && currentPos + nodeLength > startPos) {
      startNode = node;
      startOffset = startPos - currentPos;
    }

    if (!endNode && currentPos + nodeLength >= endPos) {
      endNode = node;
      endOffset = endPos - currentPos;
      break;
    }

    currentPos += nodeLength;
  }

  if (!startNode || !endNode) return null;

  const range = document.createRange();
  range.setStart(startNode, startOffset);
  range.setEnd(endNode, endOffset);
  return range;
}

window.addEventListener('load', async () => {
  const url = window.location.href;
  const result = await chrome.storage.local.get([url]);

  interface StoredLink {
    textFragment: string;
    targetLink: string;
  }

  const links: StoredLink[] = result[url] || [];

  links.forEach((link: StoredLink) => {
    const { textFragment, targetLink } = link;

    // Parse the text directive
    const directive = parseTextDirective(textFragment);
    if (!directive) {
      console.warn('Failed to parse text directive:', textFragment);
      return;
    }

    // Find the match in the document
    const range = findTextFragmentInDocument(directive);
    if (!range) {
      console.warn('Text fragment not found in document:', directive);
      return;
    }

    // Create and apply the link
    try {
      const a = document.createElement('a');
      a.href = targetLink;
      a.style.backgroundColor = 'yellow';
      a.style.color = 'inherit';
      a.style.textDecoration = 'underline';
      range.surroundContents(a);
    } catch (e) {
      console.error('Failed to create link:', e);
    }
  });
});

document.addEventListener('paste', (event: ClipboardEvent) => {
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed) return;

  const selectedText = selection.toString();
  const pastedData = event.clipboardData?.getData('text');
  if (!pastedData) return;

  try {
    new URL(pastedData);
    event.preventDefault();

    // Get surrounding context for uniqueness
    const context = getSurroundingContext(selectedText);
    let fragmentText = selectedText;

    // Build text fragment with prefix/suffix if available
    if (context.prefix && context.suffix) {
      fragmentText = `${encodeURIComponent(context.prefix).replace(/-/g, '%2D')}-,${encodeURIComponent(selectedText).replace(/-/g, '%2D')},-${encodeURIComponent(context.suffix).replace(/-/g, '%2D')}`;
    } else if (context.prefix) {
      fragmentText = `${encodeURIComponent(context.prefix).replace(/-/g, '%2D')}-,${encodeURIComponent(selectedText).replace(/-/g, '%2D')}`;
    } else if (context.suffix) {
      fragmentText = `${encodeURIComponent(selectedText).replace(/-/g, '%2D')},-${encodeURIComponent(context.suffix).replace(/-/g, '%2D')}`;
    } else {
      fragmentText = encodeURIComponent(selectedText).replace(/-/g, '%2D');
    }

    const textFragment = `#:~:text=${fragmentText}`;
    createLink(textFragment, pastedData);
  } catch (_) {
    // Pasted data is not a valid URL, do nothing
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'createLink') {
    const { textFragment, targetLink } = request;
    createLink(textFragment, targetLink)
      .then((createLinkResult) => {
        console.log('Create link result:', createLinkResult);
        sendResponse({ status: 'success' });
      })
      .catch((error) => {
        console.error('Error creating link:', error);
        sendResponse({ status: 'error', error: error.message });
      });
    return true; // Keep message channel open for async response
  }

  if (request.action === 'getSelectedText') {
    const selectedText = window.getSelection()?.toString() || '';
    const context = getSurroundingContext(selectedText);
    sendResponse({ selectedText, context });
    return true; // Explicit return for consistency
  }

  return false; // No handler for this action
});
