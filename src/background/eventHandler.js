// src/background/eventHandler.js

import { sendPageView, sendEvent } from '../services/analytics.js';

chrome.runtime.onInstalled.addListener((details) => {
	if (details.reason === 'install') {
		sendEvent('extension_installed', { install_type: 'new' });
	} else if (details.reason === 'update') {
		sendEvent('extension_updated', {
			previous_version: details.previousVersion,
			current_version: chrome.runtime.getManifest().version,
		});
	}
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
		sendEvent(request.eventName, request.eventParams);

		if (request.url) {
			chrome.tabs.create({ url: request.url });
		}

		sendResponse({ status: 'Event sent and action taken' });
	} else if (request.action === 'resetExtension') {
		sendEvent('extension_reset', {});

		chrome.storage.local.remove(
			[
				'authToken',
				'sltClientId',
				'cachedData',
				'cacheTimestamp',
				'subscriberId',
			],
			() => {
				if (chrome.runtime.lastError) {
					console.error('Error clearing data:', chrome.runtime.lastError);
					sendEvent('error', {
						error_type: 'clear_data_error',
						error_message: chrome.runtime.lastError.message,
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
