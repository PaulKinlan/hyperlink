# Active Context

This document tracks the current work focus, recent changes, and next steps. It's a living document that should be updated frequently.

## Current Focus

The current focus is on the `summary` experiment. The core functionality has been implemented.

## Recent Changes

- Refactored the `summary` extension's offscreen document to use `linkedom` for robust, browser-compatible HTML parsing.
- The service worker now fetches the HTML and passes it to the offscreen document for processing.
- Replaced the `jsdom` dependency with `linkedom`.

## Next Steps

- Test the `summary` extension thoroughly.
- Refine the popover UI and error handling.
- Add tests for the `summary` package.
- Begin work on the `merge` experiment.
