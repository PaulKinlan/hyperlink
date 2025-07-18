# Active Context

This document tracks the current work focus, recent changes, and next steps. It's a living document that should be updated frequently.

## Current Focus

The current focus is on fixing issues in the `tab-group-summary` package.

## Recent Changes

- Fixed a `TypeError` in `tab-group-summary` caused by a tab not having a URL.
- Integrated Gemini for summarization in `tab-group-summary`, using an offscreen document to parse HTML and extract markdown.
- Added `@google/genai`, `linkedom`, and `turndown` as dependencies to `tab-group-summary`.
- Updated the `manifest.json` to include the `offscreen` permission.
- Created `offscreen.html` and `src/offscreen.ts` for the `tab-group-summary` package.
- Updated the build command to include the new `offscreen.ts` file.
- The summary page for `tab-group-summary` now displays the title of the summarized page as a direct link to the original tab.
- Fixed a race condition that caused an "Only a single offscreen document may be created" error by implementing the recommended lifecycle management pattern.
- The markdown summary is now rendered as HTML on the summary page using the `marked` library.
- Fixed a "No current offscreen document" error by ensuring the offscreen document is only created and closed when there are tabs to summarize.
- Fixed an issue where the markdown summary was not being correctly extracted from the Gemini API response, causing rendering errors.
- Fixed a race condition that could cause duplicate summary tabs to be created by querying all open tabs. The extension now focuses the existing summary tab if it's already open.

## Next Steps

- Test the `tab-group-summary` extension thoroughly.
- Refine the popover UI and error handling.
- Add tests for the `tab-group-summary` package.
- Begin work on the `merge` experiment.
