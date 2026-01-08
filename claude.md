# Project Agents.md Guide

This Agents.md file provides comprehensive guidance for AI agents working with this codebase.

## Project Structure

The project is a monorepo using npm workspaces. All packages are located in the `packages/` directory.

- `packages/`: Contains all the individual packages (experiments).
  - `shared/`: A shared package for common code used across other packages.
  - `summary/`: A Chrome extension for summarizing tab groups.
  - `merge/`: A Chrome extension for merging content (in development).
  - `tab-group-summary/`: A more advanced version of the `summary` extension.
- `memory-bank/`: Contains documentation about the project's context and progress.

## Coding Conventions

### General Conventions

- All code must be written in **TypeScript**.
- Follow the existing code style in each file. ESLint and Prettier are configured to enforce this.
- Use meaningful variable and function names.
- Add comments for complex logic.

### Chrome Extension Development

- Each extension is a separate package in the `packages/` directory.
- Each package has its own `manifest.json` file.
- Background scripts, content scripts, and other extension-specific files are located in the `src/` directory of each package.
- All extensions must include an `options.html` file for user configuration (e.g., API keys).

### External APIs

- When interacting with the Gemini API, use the `@google/genai` npm package. Ensure you are using the latest version compatible with the project.

## Testing Requirements

This project uses **Vitest** for testing.

To run all tests, use the following command from the root directory:

```bash
npm test
```

To run tests for a specific package, you can use workspace commands:

```bash
npm test -w <package-name>
```

## Build Process

This project uses **Wireit** to manage the build process.

To build all packages, run the following command from the root directory:

```bash
npm run build
```

## Pull Request Guidelines

When creating a PR, please ensure it:

1. Includes a clear description of the changes.
2. References any related issues.
3. Ensures all tests pass.
4. Includes screenshots for UI changes.
5. Keeps PRs focused on a single concern.

## Programmatic Checks

Before committing code, the following checks are run automatically using a pre-commit hook:

- **Linting**: `npm run lint`
- **Formatting**: `npm run format`

All checks must pass before code can be committed.
