// src/background/eventHandler.js

import { sendPageView, sendEvent } from '../services/analytics.js';

// The display version will be injected by Vite
const DISPLAY_VERSION = __APP_VERSION__;

// Function to get the stored version
async function getStoredVersion() {
	return new Promise((resolve) => {
		chrome.storage.local.get(['extensionVersion'], (result) => {
			resolve(result.extensionVersion || 'unknown');
		});
	});
}

// Function to update the stored version
function updateStoredVersion(version) {
	chrome.storage.local.set({ extensionVersion: version });
}

chrome.runtime.onInstalled.addListener(async (details) => {
	const storedVersion = await getStoredVersion();

	if (details.reason === 'install') {
		sendEvent('extension_installed', {
			install_type: 'new',
			app_version: DISPLAY_VERSION,
		});
	} else if (details.reason === 'update') {
		sendEvent('extension_updated', {
			previous_version: storedVersion,
			current_version: DISPLAY_VERSION,
		});
	}

	// Update the stored version after sending the event
	updateStoredVersion(DISPLAY_VERSION);
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.action === 'sendPageView') {
		sendPageView(request.pageTitle, request.pageLocation);
		sendResponse({ status: 'Page view sent' });
	} else if (request.action === 'sendEvent') {
		if (request.eventName === 'extension_reset') {
			sendResponse({ status: 'Ignored' });
			return;
		}
		sendEvent(request.eventName, {
			...request.eventParams,
			app_version: DISPLAY_VERSION,
		});

		if (request.url) {
			chrome.tabs.create({ url: request.url });
		}

		sendResponse({ status: 'Event sent and action taken' });
	} else if (request.action === 'resetExtension') {
		sendEvent('extension_reset', {
			app_version: DISPLAY_VERSION,
		});

		chrome.storage.local.remove(
			[
				'authToken',
				'sltClientId',
				'cachedData',
				'cacheTimestamp',
				'subscriberId',
				// Note: We're not removing 'extensionVersion' here
			],
			() => {
				if (chrome.runtime.lastError) {
					console.error('Error clearing data:', chrome.runtime.lastError);
					sendEvent('error', {
						error_type: 'clear_data_error',
						error_message: chrome.runtime.lastError.message,
						app_version: DISPLAY_VERSION,
					});
					sendResponse({ status: 'error', message: 'Error clearing data' });
				} else {
					sendResponse({
						status: 'success',
						message: 'Data cleared successfully',
					});
				}
			}
		);
		return true; // Indicates that the response will be sent asynchronously
	}
	return true; // Keeps the message channel open for asynchronous response
});
