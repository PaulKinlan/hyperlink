# Progress

This document tracks what works, what's left to build, and the current status of the project.

## What Works

- The monorepo structure is set up with npm workspaces.
- TypeScript, Wireit, ESLint, Prettier, Husky, and Vitest are installed and configured.
- The `shared`, `merge`, and `summary` packages have been created with basic scaffolding.
- The build system is configured to build all packages.
- Code quality tools are configured to run automatically on commit.
- The `summary` extension has been refactored to use the `chrome.offscreen` API with `linkedom` for robust, browser-compatible HTML parsing.
- The `tab-group-summary` extension now uses Gemini for summarization.
- The `tab-group-summary` summary page now displays the title of the summarized page as a direct link to the original tab.
- The `tab-group-summary` extension now correctly manages the offscreen document lifecycle, preventing race condition errors.
- The `tab-group-summary` summary page now renders markdown summaries as HTML using the `marked` library.
- Fixed an error where the extension would try to close a non-existent offscreen document.
- Fixed an issue with markdown rendering due to incorrect text extraction from the Gemini API response.
- Fixed a race condition that could cause duplicate summary tabs to be created by querying all open tabs.
- The `tab-group-summary` extension now displays a screenshot of the tab next to the summary.

## What's Left to Build

- The core functionality of the `merge` Chrome extension.
- Tests for the `summary` and `merge` packages.
- Refinement of the `summary` extension's UI and error handling.
- Refinement of the `tab-group-summary` extension's UI and error handling.
- Additional experiments.

## Current Status

The `summary` and `tab-group-summary` experiments are ready for testing and refinement. The `merge` experiment is ready for development.

## Known Issues

- None at this time.
