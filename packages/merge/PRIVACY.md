# Privacy Policy for Merge Extension

**Last Updated:** January 15, 2025

## Overview

The Merge browser extension ("the Extension") is committed to protecting your privacy. This privacy policy explains how the Extension collects, uses, and safeguards your information.

## Data Collection

### Information We Store Locally

The Extension stores the following information locally in your browser's synchronized storage:

1. **API Keys**: Your API keys for AI providers (OpenAI, Anthropic, Google, or custom endpoints)
2. **Provider Configurations**:
   - Provider names
   - Selected models
   - Provider types
   - Base URLs (for custom endpoints)
   - Provider enabled/disabled status
3. **Active Provider Selection**: Which AI provider is currently active

### Information We Do NOT Collect

- We do **NOT** collect, transmit, or store any of your browsing history
- We do **NOT** collect personal information about you
- We do **NOT** track your usage of the extension
- We do **NOT** collect the content you merge or the pages you visit
- We do **NOT** send any data to our servers (we don't have any servers)

## How Your Data Is Used

### Local Storage

- All configuration data is stored locally using Chrome's `chrome.storage.sync` API
- This data synchronizes across your devices if you're signed into Chrome
- Your API keys are stored securely and never logged to the console

### Third-Party Services

When you use the merge functionality, the Extension sends data to your chosen AI provider:

- **What is sent**: The content of the current page section and the linked page content
- **Who receives it**: Only the AI provider you have configured (OpenAI, Anthropic, Google, or your custom endpoint)
- **Purpose**: To generate the merged content
- **Your control**: You choose which provider to use and can switch providers at any time

Each AI provider has their own privacy policy:

- **OpenAI**: https://openai.com/privacy
- **Anthropic**: https://www.anthropic.com/privacy
- **Google**: https://policies.google.com/privacy

## Data Security

### Local Security

- API keys are stored in Chrome's secure storage system
- Keys are never exposed in the browser console or logs
- No data is transmitted except to your chosen AI provider

### Your Control

You have complete control over your data:

- **View**: See all stored providers in the options page
- **Modify**: Edit any provider configuration at any time
- **Delete**: Remove any provider configuration
- **Export**: Your data is stored in Chrome's sync storage, which you control

## Data Retention

- Configuration data remains in your storage until you delete it
- Uninstalling the extension removes all locally stored data
- No data is retained on external servers (there are no external servers)

## Third-Party Access

The Extension does NOT:

- Sell your data to third parties
- Share your data with advertisers
- Use analytics or tracking services
- Transmit data to anyone except the AI provider you explicitly configure

## Your Rights

You have the right to:

- Access your stored configuration data through the options page
- Modify or delete your data at any time
- Uninstall the extension to remove all data
- Choose which AI provider (if any) to use

## Changes to This Policy

We may update this privacy policy from time to time. Changes will be reflected with an updated "Last Updated" date at the top of this policy.

## Open Source

This extension is open source. You can review the complete source code to verify our privacy practices:
https://github.com/PaulKinlan/hyperlink/tree/main/packages/merge

## Contact

If you have questions about this privacy policy or the Extension's data practices, please:

- Open an issue on GitHub: https://github.com/PaulKinlan/hyperlink/issues
- Email: paul@aifoc.us
- Review the source code to verify data handling practices

## Consent

By using the Merge extension, you consent to this privacy policy.

---

## Summary

**In Plain English:**

- We store your AI provider settings locally on your device
- We don't collect or track anything about you
- We don't have servers - everything is local or sent directly to your chosen AI provider
- You can view, modify, or delete your data anytime
- When you merge content, it's sent only to the AI provider you configured
- That's it - we're just a tool that connects you to AI services you choose
