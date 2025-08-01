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
- The `merge` package now correctly uses a content script to get markdown from the page.
- The `merge` package now has a click listener that detects when a link is clicked with the Option or Control key pressed, and triggers the merge process.
- The `image-links` package is implemented. It uses the SAM2 model to allow users to select objects within images and get a direct link to them.
- The `audio-link` package is implemented. It uses the Whisper model to allow users to create text fragment links for audio elements.

## What's Left to Build

- Tests for all packages.
- Refinement of the UI and error handling for all extensions.
- Additional experiments.

## Current Status

The `summary`, `tab-group-summary`, `merge`, `image-links`, and `audio-link` experiments are ready for testing and refinement.

## Known Issues

- None at this time.
