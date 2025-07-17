# Progress

This document tracks what works, what's left to build, and the current status of the project.

## What Works

- The monorepo structure is set up with npm workspaces.
- TypeScript, Wireit, ESLint, Prettier, Husky, and Vitest are installed and configured.
- The `shared`, `merge`, and `summary` packages have been created with basic scaffolding.
- The build system is configured to build all packages.
- Code quality tools are configured to run automatically on commit.
- The `summary` extension has been refactored to use the `chrome.offscreen` API with `linkedom` for robust, browser-compatible HTML parsing.

## What's Left to Build

- The core functionality of the `merge` Chrome extension.
- Tests for the `summary` and `merge` packages.
- Refinement of the `summary` extension's UI and error handling.
- Additional experiments.

## Current Status

The `summary` experiment is ready for testing and refinement. The `merge` experiment is ready for development.

## Known Issues

- None at this time.
