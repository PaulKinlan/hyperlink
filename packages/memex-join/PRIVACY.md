# Privacy Policy for Trails Browser Extension

**Last Updated:** January 17, 2025

## Overview

Trails is committed to protecting your privacy. This privacy policy explains how the extension handles your data.

## Data Collection and Storage

### What Data is Collected

Trails collects and stores the following information **locally on your device only**:

1. **Text Selections**: When you create a link, the extension stores:
   - The selected text from web pages
   - Context surrounding the selected text (prefix/suffix)
   - The URL of the page containing the selection
   - The target URL you link to

2. **Browser Information Accessed** (but not stored permanently):
   - List of open tabs (title and URL) - used only for the link creation interface
   - Recent browser history (title and URL) - used only for the link creation interface
   - Bookmarks (title and URL) - used only for the link creation interface
   - Currently active tab information

### How Data is Stored

- **All data is stored locally** using Chrome's `storage.local` API
- **No data is transmitted to external servers**
- **No data is shared with third parties**
- Data may sync across your devices if you have Chrome Sync enabled (this is controlled by your browser settings, not by the extension)

### Data You Can Access

All your link data is accessible through:

- The extension popup (click the Trails icon)
- Chrome's extension storage viewer

## Permissions Explained

The extension requires the following permissions:

- **storage**: To save your links locally on your device
- **contextMenus**: To add "Create Trail" to the right-click menu
- **activeTab**: To detect text selections on the current page
- **history**: To show your recent browsing history in the link creation interface
- **tabs**: To access open tab information for the link creation interface
- **bookmarks**: To show your bookmarks in the link creation interface

## Data Retention

- Link data is stored indefinitely until you manually delete it
- You can delete individual links using the delete button (🗑️) in the popup interface
- You can remove all data by uninstalling the extension

## Data Security

- All data is stored in your browser's local storage, which is protected by your browser's security mechanisms
- No authentication or accounts are required
- No data leaves your device (except through Chrome Sync if you have it enabled)

## Third-Party Access

- **No third-party services** are used
- **No analytics or tracking** is performed
- **No advertisements** are displayed
- **No external servers** are contacted

## Your Rights

You have complete control over your data:

- **View**: See all your links through the extension popup
- **Delete**: Remove individual links or all data at any time
- **Export**: Use browser developer tools to export your storage data if needed
- **Control**: Disable Chrome Sync if you don't want data synced across devices

## Children's Privacy

This extension does not knowingly collect any personal information from children under 13. The extension does not collect personal information from any users.

## Changes to This Policy

We may update this privacy policy from time to time. The "Last Updated" date at the top of this policy will be revised when updates are made. Continued use of the extension after changes constitutes acceptance of the updated policy.

## Open Source

This extension is open source. You can review the complete source code at:
https://github.com/PaulKinlan/hyperlink/tree/main/packages/memex-join

## Contact

If you have questions about this privacy policy or the extension, please:

- Open an issue on GitHub: https://github.com/PaulKinlan/hyperlink/issues
- Review the source code to understand exactly how your data is handled

## Summary

**Key Points:**

- ✅ All data stored locally on your device only
- ✅ No external servers or data transmission
- ✅ No tracking, analytics, or ads
- ✅ No third-party services
- ✅ You have full control to view and delete your data
- ✅ Open source - you can verify everything
- ✅ No accounts or authentication required
