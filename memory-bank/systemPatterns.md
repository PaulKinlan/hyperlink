# System Patterns

This document outlines the system architecture, key technical decisions, and design patterns used in the project.

## System Architecture

The project is a monorepo containing multiple, independent packages (experiments) located in the `packages/` directory. A `shared` package is available for common code.

## Design Patterns

- **Monorepo**: A single repository contains multiple projects, simplifying dependency management and code sharing.
- **Workspace**: npm workspaces are used to manage the packages within the monorepo.

## Key Technical Decisions

- **TypeScript First**: All code is written in TypeScript to leverage static typing.
- **Automated Code Quality**: ESLint and Prettier are used to enforce a consistent code style, and are run automatically on commit.
- **Declarative Builds**: Wireit is used to define and manage the build process for each package in a declarative way.
