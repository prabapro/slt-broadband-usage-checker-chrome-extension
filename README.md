# SLT Broadband Usage Checker (Unofficial) Chrome Extension

[![Chrome Web Store Logo](available-in-chrome.png)](https://chromewebstore.google.com/detail/slt-broadband-usage-check/cdmfcngnfgnhddcheambbdjdjmelnoep)

## Overview

**Check SLT Broadband usage with a single click**

🔥 Easily check your SLT (Sri Lanka Telecom 🇱🇰) Broadband Usage with just one click.

---

### 🚀 Key Features:

- **Secure Access**: Uses your existing MySLT Portal authentication - no separate login required.
- **Quick Access**: View your data usage directly from your browser toolbar.
- **Comprehensive Data**: See usage details for Main Pack, Extra GB, Bonus Data, Add-Ons, and Free Data.
- **Visual Progress Bars**: Easily understand your data consumption with color-coded progress bars.
- **Auto-Refresh**: Data automatically refreshes every hour, or manually refresh anytime.
- **Last Updated Info**: Always know when your data was last refreshed.
- **Easy Re-login**: Quick access to the MySLT portal if re-authentication is needed.
- **Support Access**: Direct link to contact support for any issues or queries.

### 🔥 How It Works:

- **Install & Log In**: Install the extension and log in to your MySLT account via the official MySLT Portal.
- **View Data Usage**: Once you’re logged in, click the extension icon to see your current data usage.
- **Secure Access**: The extension safely uses your active MySLT session to fetch the data—no need to enter your credentials in the extension.
- **Refresh Anytime**: Hit the ‘Refresh’ button to get the latest data instantly.
- **Clear Data**: Use the ‘Clear Data & Re-authenticate’ button to reset the data stored in the extension. This won’t log you out of the MySLT Portal.

### 🔐 Privacy & Security:

- This unofficial extension securely fetches data from SLT's official API using your existing MySLT Portal authentication.
- It does not store or have access to your login credentials.
- Your personal information is never transmitted or stored by the extension.

### ❗Note:

- This is an unofficial extension and is not affiliated with, endorsed by, or connected to Sri Lanka Telecom PLC in any way. It is an independent tool created to enhance user experience.
- Some promotional materials, including screenshots and store tiles, may display simulated data for demonstration purposes. Actual usage data will vary based on individual user accounts.

🤝 Support: prabapro+chromeapps@gmail.com

---

# 👨‍💻 Development

> [!NOTE]
> Built with Vite and Vanilla JS

## 1. Project Setup

1. Create a new directory for your project and navigate into it:

   ```bash
   mkdir slt-bb-usage-checker
   cd slt-bb-usage-checker
   ```

2. Initialize a new Node.js project:

   ```bash
   npm init -y
   ```

3. Install Vite and other necessary dependencies:

   ```bash
   npm install --save-dev vite fs-extra archiver
   ```

4. Create the project structure and empty files:

   ```bash
   # Create directories
   mkdir -p src/{background,content,popup,services,utils} public/images dist_zip

   # Create empty files
   touch src/background/{background.js,eventHandler.js} \
         src/content/content.js \
         src/popup/{popup.html,popup.js,popup.css} \
         src/services/analytics.js \
         src/utils/helpers.js \
         public/manifest.json \
         build.js \
         vite.config.js

   # Create placeholder image files (replace these with actual icons)
   touch public/images/{icon16.png,icon32.png,icon48.png,icon128.png}
   ```

5. Verify the project structure:
   ```bash
   tree
   ```
   You should see a structure similar to this:
   ```
   .
   ├── build.js
   ├── package.json
   ├── public
   │   ├── images
   │   │   ├── icon128.png
   │   │   ├── icon16.png
   │   │   ├── icon32.png
   │   │   ├── icon48.png
   │   │   └── slt-logo.png
   │   └── manifest.json
   ├── src
   │   ├── background
   │   │   ├── background.js
   │   │   └── eventHandler.js
   │   ├── content
   │   │   └── content.js
   │   ├── popup
   │   │   ├── popup.css
   │   │   ├── popup.html
   │   │   └── popup.js
   │   ├── services
   │   │   └── analytics.js
   │   └── utils
   │       └── helpers.js
   └── vite.config.js
   ```

## 2. Project Structure

Your project should have the following directory structure:

```
slt-bb-usage-checker/
├── src/
│   ├── background/
│   │   ├── background.js
│   │   ├── eventHandler.js
│   ├── content/
│   │   └── content.js
│   ├── popup/
│   │   ├── popup.html
│   │   ├── popup.js
│   │   └── popup.css
│   ├── services/
│   │   └── analytics.js
│   └── utils/
│       └── helpers.js
├── public/
│   ├── manifest.json
│   └── images/
│       ├── icon16.png
│       ├── icon32.png
│       ├── icon48.png
│       └── icon128.png
├── dist/              (created during build)
├── dist_zip/          (created during build)
├── build.js
├── vite.config.js
└── package.json
```

> [!NOTE]
>
> - The `dist` folder will be created during the build process and will contain your compiled extension.
> - The `dist_zip` folder will contain zipped versions of your built extension, ready for distribution.
> - Ensure that `dist/` and `dist_zip/` are added to your `.gitignore` file.

## 3. Configuration Files

### 3.1 Update `package.json`:

```
{
	"name": "slt-bb-usage-checker",
	"private": true,
	"version": "0.0.0",
	"type": "module",
	...
}
```

### 3.2 Create `vite.config.js`:

```
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
   ...
});

```

### 3.3 Create `build.js`:

```
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const execAsync = promisify(exec);
...
```

## 4. Extension Files

### 4.1 Create `manifest.json` in the `public` folder:

```
{
	"manifest_version": 3,
	"name": "SLT Broadband Usage Checker (Unofficial)",
	"version": "1.0.0",
	"description": "Check SLT Broadband usage with a single click",
	"permissions": ["storage", "webRequest", "scripting"],
	...
}

```

### 4.2 Implement `background.js` & `eventHandler.js`:

- Use ES module syntax
- Implement necessary background script functionality

### 4.3 Implement `content.js`:

- Avoid using ES module syntax (not supported in content scripts)
- Implement necessary content script functionality

### 4.4 Create `popup.html`:

- Structure the popup UI
- Link to `popup.css` and `popup.js`

### 4.5 Implement `popup.js`:

- Use ES module syntax
- Implement popup functionality

### 4.6 Style `popup.css`:

- Define styles for the popup UI

### 4.7 Create `helpers.js` in the `utils` folder:

- Implement shared utility functions

### 4.8 Create `analytics.js` in the `services` folder:

- Implement Google Analytics events

## 5. Building the Extension

> [!TIP]
>
> - Update the version only in `package.json` - The build process will automatically update the version in `manifest.json` and `popup.html`.
> - Always run the build process before testing or distributing your extension to ensure all files are up-to-date.

1. Update the version in `package.json` if you're preparing a new release:

   ```json
   {
   	"version": "1.0.2"
   }
   ```

2. Run the build command:

   ```bash
   npm run build
   ```

3. The build process will:

   - Compile and bundle your source files using Vite
   - Update the version in `manifest.json` and `popup.html`
   - Move files to their correct locations in the `dist` folder
   - Clean up any unnecessary files or directories

4. After the build, a zip file of your extension will be created:

   - The zip file will be named `release_v{version}.zip` (e.g., `release_v1.0.2.zip`)
   - It will be located in the `dist_zip` folder in your project root
   - This zip file contains the contents of the `dist` folder, ready for distribution

5. Verify that the `dist` folder contains the correct structure:

   ```
   dist/
   ├── images/
   ├── assets/
   ├── background.js
   ├── content.js
   ├── eventHandlers.js
   ├── manifest.json
   ├── popup.css
   ├── popup.html
   └── popup.js
   ```

6. The `dist_zip` folder will contain your zipped extension:
   ```
   dist_zip/
   └── release_v1.0.2.zip
   ```

> [!NOTE]
>
> - The `dist` folder contains your unpackaged extension, which you can use for testing in Chrome.
> - The zip file in `dist_zip` is what you would submit to the Chrome Web Store for publication.
> - Always test the unpacked extension from the `dist` folder before distributing the zip file to ensure everything works as expected.

## 6. Loading the Extension in Chrome

1. Open Google Chrome and navigate to `chrome://extensions`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked" and select the `dist` folder from your project
4. Verify that the extension loads without errors

## 7. Development Workflow

1. Make changes to your source files in the `src` directory
2. Run `npm run build` to rebuild the extension
3. In Chrome, go to `chrome://extensions` and click the refresh icon on your extension to reload it
4. Test the changes in the browser

## 8. Troubleshooting

1. If the popup doesn't display correctly, check the console for errors
2. Ensure all paths in `manifest.json` are correct
3. Verify that `content.js` doesn't use ES module syntax
4. Check that all necessary files are present in the `dist` folder after building

## 9. Best Practices

1. Use ES module syntax in all files except `content.js`
2. Update the version in `package.json` - Vite will automatically update the version in `manifest.json` & `popup.html` during the build process.
3. Keep the build script updated if you add new files or change the project structure
4. Regularly test the extension in Chrome to catch any issues early

---

# 📊 Google Analytics Events

This extension uses Google Analytics 4 (GA4) [Measurement Protocol](https://developers.google.com/analytics/devguides/collection/protocol/ga4) to track various events for usage analysis and improvement purposes. Below is a comprehensive table of all events and their parameters:

| Event Name              | Description                                                       | Parameters                                                                                              |
| ----------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `page_view`             | Fired when a page is viewed                                       | `page_title`: string<br>`page_location`: string<br>`app_version`: string                                |
| extension_installed     | Fired when the extension is first installed                       | `install_type`: `new`                                                                                   |
| `extension_updated`     | Fired when the extension is updated                               | `previous_version`: string<br>`current_version`: string                                                 |
| `extension_reset`       | Fired when the user resets the extension                          | No additional parameters                                                                                |
| `refresh_clicked`       | Fired when the user clicks the refresh button                     | No additional parameters                                                                                |
| `support_page_opened`   | Fired when the user opens the support page                        | No additional parameters                                                                                |
| `review_page_opened`    | Fired when the user opens the review page                         | No additional parameters                                                                                |
| `welcome_login_clicked` | Fired when the user clicks the login button on the welcome screen | No additional parameters                                                                                |
| `usage_checked`         | Fired when the usage data is checked                              | `data_source`: `cache` or `api`                                                                         |
| `group_viewed`          | Fired when a usage data group is viewed                           | `group_name`: string<br>`band_name`: string                                                             |
| `speed_status_checked`  | Fired when the speed status is checked                            | `speed_status`: string (`normal`, `throttled` etc)                                                      |
| `error`                 | Fired when an error occurs                                        | `error_type`: string<br>`error_message`: string (optional)<br>`endpoint`: string (for API fetch errors) |

Common parameters included in all events:

- `session_id`: string
- `engagement_time_msec`: number (default: 100)
- `app_version`: string (current extension version)

## Notes on Analytics Events

1. The `app_version` is automatically included in all events.
2. The `session_id` and `engagement_time_msec` are handled by the analytics service and included in all events.
3. Some events (like `extension_reset`) don't have additional parameters beyond the common ones.
4. The `error` event can have different parameters depending on the type of error.

## Maintaining Analytics

- **Consistency**: Ensure that the event names and parameters used in the code match exactly with what's listed in this table.
- **Documentation**: Keep this table updated as part of the project documentation. Update it when adding new features or modifying existing ones.
- **GA4 Configuration**: Use this table as a reference when setting up custom definitions in your GA4 property.
- **Future Planning**: When planning new features, use this table to identify if you need to add new events or modify existing ones.
- **Debugging**: Use this table as a quick reference when debugging analytics issues.

## Debugging Analytics Events

To debug analytics events in the popup and service worker:

1. For popup events:

   - Open the extension popup
   - Right-click and select "Inspect" to open Chrome DevTools
   - In the Console tab, you'll see logs for each event being sent

2. For service worker events:

   - Go to `chrome://extensions`
   - Find your extension and click on "Inspect views: service worker"
   - In the Console tab, you'll see logs for events handled by the service worker

3. Enable GA4 DebugView:

   > [!WARNING] Remove any debug code or console logs before publishing the extension.

   - In your GA4 property, go to Admin > DebugView
   - In your extension's background script, add `&debug_mode=1` to the `GA4_ENDPOINT URL`
   - Events will now appear in real-time in the DebugView

4. Use the Network tab in DevTools to inspect the actual requests being sent to GA4. Look for requests to `www.google-analytics.com`.
