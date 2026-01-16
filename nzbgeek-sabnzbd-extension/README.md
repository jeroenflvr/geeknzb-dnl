# NZBgeek to SABnzbd Chrome Extension

This Chrome extension adds convenient "Send to SABnzbd" buttons to NZBgeek.info search results, allowing you to download NZB files and automatically upload them to your SABnzbd server with a single click.

## Features

- Adds "🎬 Movies" and "📺 Series" buttons next to each download link on NZBgeek.info
- Support for two separate SABnzbd servers (one for movies, one for series)
- Downloads NZB files and uploads them directly to your configured SABnzbd server
- Automatically extracts the release name for proper naming in SABnzbd
- Configurable SABnzbd URL, API key, and category for each server
- Connection test feature for both servers
- Visual feedback for successful and failed uploads

## Installation

### Step 1: Create Icons (Optional but Recommended)

The extension needs icon files. You can:

1. Create your own 16x16, 48x48, and 128x128 PNG icons named:
   - `icon16.png`
   - `icon48.png`
   - `icon128.png`

2. Or use a simple placeholder by creating a basic icon using any image editor

3. Place these icon files in the extension directory

Alternatively, you can use online icon generators or the following quick method:
- Go to https://favicon.io/favicon-generator/
- Create a simple icon with text "NZB" or "SAB"
- Download and rename the files as needed

### Step 2: Load the Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in the top right)
3. Click "Load unpacked"
4. Select the `nzbgeek-sabnzbd-extension` folder
5. The extension should now appear in your extensions list

### Step 3: Configure SABnzbd Settings

1. Click the extension icon in your Chrome toolbar
2. Click "Open Settings" or right-click the extension and select "Options"
3. Configure your **Movies SABnzbd server**:
   - **SABnzbd URL**: The full URL to your movies SABnzbd server (e.g., `http://192.168.1.100:8080`)
   - **API Key**: Found in SABnzbd under Config > General > Security > API Key
   - **Category** (Optional): Category for movie downloads (e.g., "movies")
   - Click "Test Movies Connection" to verify
4. Configure your **Series SABnzbd server**:
   - **SABnzbd URL**: The full URL to your series SABnzbd server (can be the same as movies)
   - **API Key**: Found in SABnzbd under Config > General > Security > API Key
   - **Category** (Optional): Category for series downloads (e.g., "tv", "series")
   - Click "Test Series Connection" to verify
5. Click "Save All Settings"

**Note:** You can use the same SABnzbd server for both movies and series - just configure different categories to organize your downloads.

## Usage

1. Navigate to https://nzbgeek.info and perform a search
2. You'll see two buttons next to each download link:
   - **🎬 Movies** (pink) - Sends to your Movies SABnzbd server
   - **📺 Series** (blue) - Sends to your Series SABnzbd server
3. Click the appropriate button to download the NZB and send it to SABnzbd
4. The button will show:
   - "⏳ Sending..." while uploading
   - "✅ Sent!" on success
   - "❌ Failed" if there's an error

## Troubleshooting

### Connection Issues

If you see "Connection failed" or "❌ Failed":

1. Verify your SABnzbd URL is correct and accessible
2. Make sure your API key is correct
3. Check that SABnzbd is running
4. If SABnzbd uses HTTPS, ensure the certificate is valid
5. Check browser console (F12) for detailed error messages

### CORS Issues

If you encounter CORS errors when uploading to SABnzbd:

1. Make sure you're accessing SABnzbd with the correct protocol (http/https)
2. Consider accessing SABnzbd via localhost if it's on the same machine
3. Check SABnzbd's host whitelist settings

### Buttons Not Appearing

If buttons don't show up on NZBgeek:

1. Refresh the page
2. Check that the extension is enabled in `chrome://extensions/`
3. Verify you're on nzbgeek.info (not another NZB site)

### Downloads Named "download" in SABnzbd

If your downloads appear as "download" instead of the actual release name:

1. This is usually caused by the NZB site not providing a filename
2. The extension tries to extract the name from the Content-Disposition header and URL parameters
3. If the issue persists, the NZB site may not be providing this information

## Privacy

This extension:
- Only runs on nzbgeek.info pages
- Stores your SABnzbd URLs and API keys locally in Chrome's sync storage
- Does not send any data to third parties
- Only communicates with NZBgeek and your configured SABnzbd servers

## Support

For issues or feature requests, check the browser console (F12) for error messages and verify your SABnzbd configuration.

## License

This extension is provided as-is for personal use.
