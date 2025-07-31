# Tech Context

This document describes the technologies, development setup, and technical constraints for the project.

## Technologies

- **TypeScript**: The primary language for all packages.
- **npm Workspaces**: For managing the monorepo.
- **Wireit**: For orchestrating builds across the monorepo.
- **ESLint**: For code linting.
- **Prettier**: For code formatting.
- **Husky & lint-staged**: For enforcing code style on commits.
- **Vitest**: For testing.
- **ONNX Runtime Web**: For running machine learning models in the browser.
- **SAM2 (Segment Anything Model 2)**: A specific ML model used for image segmentation, hosted on Hugging Face.

## Development Setup

The project is set up as a monorepo with npm workspaces. All packages are located in the `packages` directory.

To build all packages, run `npm run build` from the root directory.

To run tests, run `npm run test` from the root directory.

## Technical Constraints

_To be defined._
