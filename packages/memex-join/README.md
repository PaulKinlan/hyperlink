# Trails

A browser extension that enables you to create persistent links between any text on any web page, building your own trails of associated content across the web.

## Overview

Trails allows you to select text on any webpage and create bidirectional links to other content, similar to how you would make connections in your mind. These links persist across browsing sessions and automatically highlight when you revisit pages, helping you build a personal web of interconnected knowledge.

Inspired by Vannevar Bush's visionary 1945 concept of the Memex, Trails brings the idea of associative trails to the modern web, letting you create your own paths through information without requiring any server infrastructure or website modifications.

## Features

- **Select & Link**: Highlight any text on any webpage and link it to related content
- **Automatic Highlighting**: Links automatically appear when you revisit pages
- **Text Fragment Technology**: Uses the web standard Text Fragments API for precise, stable linking
- **Context-Aware Matching**: Intelligently uses prefix/suffix context to ensure links point to the correct text even when there are duplicates
- **Bidirectional Links**: See both outgoing links (what this text links to) and incoming links (what links to this text)
- **Tab Integration**: Quick access to open tabs, history, and bookmarks when creating links
- **Privacy-First**: All data stored locally in your browser - no external servers
- **Keyboard Shortcut**: Quick link creation with `Ctrl+Shift+K` (Windows/Linux) or `Command+Shift+K` (Mac)

## Installation

### From Source

1. Clone the repository:

   ```bash
   git clone https://github.com/PaulKinlan/hyperlink.git
   cd hyperlink/packages/memex-join
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Build the extension:

   ```bash
   npm run build
   ```

4. Load in Chrome/Edge:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist/` folder

### From Package

1. Download the latest release `.zip` file
2. Extract to a local folder
3. Load in Chrome/Edge as described above

## Usage

### Creating Links

1. **Select text** on any webpage that you want to link from
2. **Press the keyboard shortcut** (`Ctrl+Shift+K` or `Command+Shift+K`)
3. **Choose a destination** from the interface:
   - Open tabs
   - Recent history
   - Bookmarks
   - Previously created links
4. The link is created and both pages will show highlights when visited

### Viewing Links

- Click the Trails icon in your browser toolbar to see:
  - **All Links**: Complete list of all your trail connections
  - **Current Page**: Links specific to the page you're viewing
- Highlighted text on pages indicates linked content
- Click highlighted text to follow the link

## How It Works

### Text Fragments

Trails uses the W3C Text Fragments specification to create precise, stable links to text:

```
https://example.com/page#:~:text=[prefix-,]textStart[,textEnd][,-suffix]
```

**Key Technical Features:**

- **Case-insensitive matching**: Links work regardless of text case changes
- **Word boundary detection**: Ensures matches at complete words, not partial matches
- **Context prefixes/suffixes**: Disambiguates when the same text appears multiple times
- **Block-level awareness**: Respects HTML document structure in matching
- **Invisible content filtering**: Ignores hidden elements and non-searchable text

### Storage

All link data is stored locally using Chrome's `storage.sync` API:

- Synchronizes across your devices (if sync is enabled)
- No external servers or accounts required
- Complete privacy and data ownership

## Development

### Build System

The project uses [Wireit](https://github.com/google/wireit) for efficient builds:

```bash
# Development build
npm run build

# Create distribution package
npm run zip
```

### Project Structure

```
packages/memex-join/
├── src/
│   ├── background.ts    # Service worker, context menus
│   ├── content.ts       # Page content highlighting and matching
│   ├── popup.ts         # Extension popup interface
│   └── create-link.ts   # Link creation interface
├── manifest.json        # Extension manifest
├── popup.html          # Popup UI
├── create-link.html    # Link creation UI
├── ui.css              # Shared styles
└── icons/              # Extension icons
```

## Technical Details

### Spec Compliance

The text fragment matching implementation follows the [WICG Scroll to Text Fragment specification](https://wicg.github.io/scroll-to-text-fragment/):

- Exact character-for-character matching with normalization
- Unicode-aware word boundary detection
- Proper handling of all text directive formats
- Block-level element traversal
- Prefix/suffix context validation

### Browser Compatibility

- Chrome/Edge: Full support (Manifest V3)
- Firefox: Text Fragments API support required
- Safari: Limited (Text Fragments not yet supported)

## Inspiration: The Memex

In 1945, Vannevar Bush described the Memex in "As We May Think":

> "The human mind... operates by association. With one item in its grasp, it snaps instantly to the next that is suggested by the association of thoughts... Man cannot hope fully to duplicate this mental process artificially, but he certainly ought to be able to learn from it."

Trails brings this vision to the modern web, letting you create associative trails through information just as Bush imagined.

## Privacy & Security

- **No data collection**: No analytics, tracking, or data sent to external servers
- **Local storage only**: All data stored in browser's local storage
- **Open source**: Full source code available for inspection
- **No account required**: Works completely offline after installation

For complete details, see our [Privacy Policy](PRIVACY.md).

## Future Enhancements

- [ ] Visual link graph/map view
- [ ] Export/import trail collections
- [ ] Collaborative trails (optional)
- [ ] Advanced search and filtering
- [ ] Link annotations and notes
- [ ] Tag-based organization

## Contributing

Contributions welcome! Please see the main repository for guidelines.

## License

See the LICENSE file in the root of the repository.

## Credits

- Inspired by Vannevar Bush's Memex concept
- Built on the Text Fragments web standard
- Part of the [Hyperlink Experiments](https://github.com/PaulKinlan/hyperlink) project
