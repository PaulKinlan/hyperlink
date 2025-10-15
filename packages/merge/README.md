# Merge

A browser extension that intelligently merges the content of a linked page with the current page using AI.

## Features

- **Smart Content Merging**: Uses AI to seamlessly integrate linked content into the current page while preserving context
- **Multiple AI Provider Support**: Choose from OpenAI, Anthropic (Claude), Google (Gemini), or custom endpoints
- **Easy Configuration**: User-friendly options page to manage multiple API providers
- **Visual Feedback**: Loading indicators and notifications keep you informed during the merge process
- **Keyboard Shortcuts**: Simply hold Shift or Ctrl/Cmd and click a link to merge its content

## How It Works

1. Hold the **Shift** or **Ctrl/Cmd** key
2. Click any link on the current page
3. The extension fetches the linked page's content
4. AI intelligently merges the content into the current page
5. The merged content appears in place, maintaining the original link

## Setup

### 1. Install the Extension

Load the extension in your browser:

- Chrome/Edge: Navigate to `chrome://extensions`, enable "Developer mode", and load the `packages/merge` directory
- Firefox: Navigate to `about:debugging#/runtime/this-firefox` and load the `manifest.json` file

### 2. Configure an AI Provider

Click the extension icon and select "Options" (or right-click the extension icon → Options).

#### Supported Providers

##### OpenAI

1. Get an API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Select "OpenAI" as provider type
3. Enter your API key
4. Choose a model: `gpt-5` or `gpt-5-nano`
5. Test the connection and save

##### Anthropic (Claude)

1. Get an API key from [Anthropic Console](https://console.anthropic.com/)
2. Select "Anthropic (Claude)" as provider type
3. Enter your API key
4. Choose model: `claude-4-5-sonnet`
5. Test the connection and save

##### Google (Gemini)

1. Get an API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Select "Google (Gemini)" as provider type
3. Enter your API key
4. Choose a model: `gemini-2.5-flash`, `gemini-2.5-flash-lite`, or `gemini-2.5-pro`
5. Test the connection and save

##### Custom Endpoint

For self-hosted models or other OpenAI-compatible APIs:

1. Select "Custom Endpoint" as provider type
2. Enter your API key
3. Enter the base URL (e.g., `https://api.example.com/v1`)
4. Enter your model name
5. Test the connection and save

**Supported custom endpoints:**

- Azure OpenAI
- Ollama (running locally)
- LM Studio
- Any OpenAI-compatible API

### 3. Managing Providers

- **Add Multiple Providers**: Click "+ Add Provider" to configure additional AI services
- **Switch Providers**: Double-click any provider in the sidebar to make it active
- **Edit Provider**: Click on a provider to modify its settings
- **Delete Provider**: Select a provider and click the "Delete" button
- **Test Connection**: Verify your API key works before saving

## Usage

There are two ways to merge link content:

### Method 1: Keyboard Shortcut

1. Navigate to any webpage
2. Hold **Shift** or **Ctrl/Cmd** (Windows/Linux) or **⌘** (Mac)
3. Click on any link
4. Wait for the loading indicator
5. The merged content will replace the original paragraph

### Method 2: Right-Click Context Menu

1. Navigate to any webpage
2. Right-click on any link
3. Select "Merge Link Content" from the context menu
4. Wait for the loading indicator
5. The merged content will replace the original paragraph

## Features in Detail

### Smart Merging

The AI analyzes both the current page content and the linked page content to create a cohesive merged result that:

- Preserves the original context and flow
- Integrates new information naturally
- Maintains the link for reference
- Returns valid HTML that blends seamlessly

### Visual Feedback

- **Loading Indicator**: Shows "⏳ Merging content..." next to the link
- **Success Notification**: Green notification confirms successful merge
- **Error Notification**: Red notification shows detailed error messages

### Error Handling

- No provider configured? Get a helpful message to set one up
- Network issues? Clear error messages explain what went wrong
- Invalid API key? Test your connection before saving

## Migration from v1.0

If you were using the previous version with a Gemini API key:

- Your API key will be automatically migrated to the new multi-provider system
- The migrated provider will be named "Google Gemini (Migrated)"
- You can edit, rename, or delete it like any other provider

## Privacy & Security

- API keys are stored securely in Chrome's synchronized storage
- Keys are never logged or exposed in the console
- All AI processing happens via your chosen provider's API
- No data is sent to third parties other than your configured AI provider

## Troubleshooting

### "No active provider configured"

- Open the options page and configure at least one provider
- Make sure the provider is enabled (checkbox is checked)
- Double-click the provider to make it active

### "Connection failed" during test

- Verify your API key is correct
- Check that you have sufficient credits/quota with the provider
- For custom endpoints, ensure the base URL is correct and accessible

### Merge not working

- Check browser console for error messages
- Verify you're holding the correct modifier key (Shift or Ctrl/Cmd)
- Ensure the link has a valid parent element

### Content not merging properly

- Some complex page structures may not merge well
- Try clicking different links or elements
- Check that the AI provider is responding (test connection in options)

## Development

Build the extension:

```bash
cd packages/merge
npm install
npm run build
```

The built extension will be in the `dist/` directory.

## Technologies

- TypeScript
- Vercel AI SDK
- Multiple AI provider SDKs (OpenAI, Anthropic, Google)
- Turndown (HTML to Markdown conversion)
- Chrome Extension APIs

## License

MIT
