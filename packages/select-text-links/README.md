# Select Text Open Hyperlinks

A Chrome extension that allows users to select text on a webpage and open all hyperlinks within that selection in new tabs via a right-click context menu.

## Features

- Right-click on any selected text
- Select "Open links in selection" from the context menu
- All hyperlinks within the selection are opened in new background tabs

## Installation

1. Build the extension:
   ```bash
   npm run build
   ```

2. Load the extension in Chrome:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `packages/select-text-links` directory

## Usage

1. Select any text on a webpage that contains hyperlinks
2. Right-click on the selected text
3. Click "Open links in selection" from the context menu
4. All links within the selection will open in new tabs
