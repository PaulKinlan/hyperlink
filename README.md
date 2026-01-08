# Hyperlink Experiments

This project is a monorepo that contains multiple packages that are experiments with hyperlinks.

## Packages

This monorepo contains the following packages:

-   `audio-link`: A browser extension that makes audio content on web pages more accessible and linkable.
-   `backlinks`: A browser extension that helps you build a graph of your browsing history by tracking backlinks and navigation paths.
-   `blockquote`: A browser extension that updates blockquotes with live content from their `cite` URLs to keep them up-to-date.
-   `image-link`: A browser extension that makes every part of an image on the page clickable and discoverable.
-   `image-links`: A browser extension for working with image links on web pages.
-   `memex-join` (Trails): A browser extension that enables you to create persistent links between any text on any web page, building your own trails of associated content across the web. Inspired by Vannevar Bush's Memex concept.
-   `merge`: A browser extension that intelligently merges the content of a linked page with the current page using AI.
-   `shared`: Shared code and utilities used by the other packages in this monorepo.
-   `stretchtext`: A browser extension that implements Ted Nelson's Stretchtext concept, allowing users to expand or contract document sections to reveal more or less detail.
-   `summary`: A browser extension that allows you to summarize the current page using a large language model.
-   `tab-group-summary`: A browser extension that summarizes all the tabs in a group using a large language model.
-   `ui-links`: A browser extension to stream UI components from one page to another.

## Getting Started

To get started, you'll need to install the dependencies:

```bash
npm install
```

## Building

To build all the packages, run the following command:

```bash
npm run build
```

This will create a `dist` directory in each package with the built extension.

## Testing

To run the tests for all the packages, run the following command:

```bash
npm test
```
