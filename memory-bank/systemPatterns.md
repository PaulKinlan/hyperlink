# System Patterns

This document outlines the system architecture, key technical decisions, and design patterns used in the project.

## System Architecture

The project is a monorepo containing multiple, independent packages (experiments) located in the `packages/` directory. A `shared` package is available for common code.

## Design Patterns

- **Monorepo**: A single repository contains multiple projects, simplifying dependency management and code sharing.
- **Workspace**: npm workspaces are used to manage the packages within the monorepo.
- **Offscreen API for ML**: For extensions that run machine learning models, the `chrome.offscreen` API is used to run the model in a separate, hidden document. This is necessary because service workers do not have access to WebGPU, which is often required for efficient model execution. The service worker acts as a router, forwarding messages from the content script to the offscreen document.

## Key Technical Decisions

- **TypeScript First**: All code is written in TypeScript to leverage static typing.
- **Automated Code Quality**: ESLint and Prettier are used to enforce a consistent code style, and are run automatically on commit.
- **Declarative Builds**: Wireit is used to define and manage the build process for each package in a declarative way.
