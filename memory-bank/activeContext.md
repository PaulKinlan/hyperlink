# Active Context

This document tracks the current work focus, recent changes, and next steps. It's a living document that should be updated frequently.

## Current Focus

The current focus is on the new `ui-links` package.

## Recent Changes

- **`ui-links` package**: Created a new extension that allows users to stream a UI component from a linked page onto the current page.
- **`ui-links` package**: Uses the `chrome.tabCapture` API to get a `MediaStream` of a target tab.
- **`ui-links` package**: A background script manages opening the target tab, getting the stream, and sending the stream ID to the content script.
- **`ui-links` package**: A content script receives the stream and displays it in a floating video element, cropped to the dimensions of the target element.
- **`audio-link` package**: Created a new extension that allows users to create text fragment links for audio elements.
- **`audio-link` package**: Uses the Whisper model from Hugging Face, run locally in the browser using ONNX Runtime Web and Transformers.js.
- **`audio-link` package**: Implemented the `chrome.offscreen` API to run the ML model.
- **`image-links` package**: Created a new extension that allows users to click on any object within an image to get a direct link to that object.
- **`image-links` package**: Uses the SAM2 (Segment Anything Model 2) from Hugging Face, run locally in the browser using ONNX Runtime Web.
- **`image-links` package**: Implemented the `chrome.offscreen` API to run the ML model, as WebGPU is not available in service workers.
- **`image-links` package**: The content script detects when the 'Alt' key is pressed and the user hovers over an image. It then creates a canvas overlay to capture clicks.
- **`image-links` package**: On click, the coordinates are used as a point prompt for the SAM2 model to generate a mask for the selected object.
- **`image-links` package**: The generated mask is drawn on the canvas, and a URL with a fragment identifier for the object is copied to the clipboard.
- **`tab-group-summary` package**: Fixed a `TypeError` caused by a tab not having a URL.
- **`tab-group-summary` package**: Integrated Gemini for summarization, using an offscreen document to parse HTML and extract markdown.
- **`tab-group-summary` package**: Added `@google/genai`, `linkedom`, and `turndown` as dependencies.
- **`tab-group-summary` package**: Updated the `manifest.json` to include the `offscreen` permission.
- **`tab-group-summary` package**: Created `offscreen.html` and `src/offscreen.ts`.
- **`tab-group-summary` package**: Updated the build command to include the new `offscreen.ts` file.
- **`tab-group-summary` package**: The summary page now displays the title of the summarized page as a direct link to the original tab.
- **`tab-group-summary` package**: Fixed a race condition that caused an "Only a single offscreen document may be created" error.
- **`tab-group-summary` package**: The markdown summary is now rendered as HTML on the summary page using the `marked` library.
- **`tab-group-summary` package**: Fixed a "No current offscreen document" error.
- **`tab-group-summary` package**: Fixed an issue where the markdown summary was not being correctly extracted from the Gemini API response.
- **`tab-group-summary` package**: Fixed a race condition that could cause duplicate summary tabs to be created.
- **`tab-group-summary` package**: Added screenshots to the summary page.
- **`merge` package**: Refactored to use a content script to get markdown from the page.
- **`merge` package**: Added a click listener to the content script to detect when a link is clicked with the Option or Control key pressed.

## Next Steps

- Test the `ui-links` extension thoroughly.
- Test the `audio-link` extension thoroughly.
- Test the `image-links` extension thoroughly.
- Test the `merge` extension thoroughly.
- Test the `tab-group-summary` extension thoroughly.
- Refine the popover UI and error handling for all extensions.
- Add tests for all packages.
