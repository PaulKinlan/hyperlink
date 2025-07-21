# Hyperlink Experiments

This project is a monorepo that contains multiple packages that are experiments with hyperlinks.

## Packages

This monorepo contains the following packages:

-   `blockquote`: A Chrome extension that updates blockquotes with live content from a URL.
-   `merge`: A Chrome extension for merging content.
-   `summary`: A Chrome extension for summarizing links.
-   `tab-group-summary`: A Chrome extension that summarizes each page inside a tab group.

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
