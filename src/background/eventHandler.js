import { sendEvent } from '../services/analytics.js';

chrome.runtime.onInstalled.addListener((details) => {
	if (details.reason === 'install') {
		console.log('Extension installed');
		sendEvent(
			'extension_installed',
			{
				install_type: 'new',
			},
			chrome.runtime.getManifest().version
		);
	} else if (details.reason === 'update') {
		console.log('Extension updated');
		sendEvent(
			'extension_updated',
			{
				previous_version: details.previousVersion,
				current_version: chrome.runtime.getManifest().version,
			},
			chrome.runtime.getManifest().version
		);
	}
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.action === 'sendEvent') {
		sendEvent(
			request.eventName,
			request.eventParams,
			chrome.runtime.getManifest().version
		);

		// Handle tab opening based on the event
		if (request.url) {
			chrome.tabs.create({ url: request.url });
		}

		sendResponse({ status: 'Event sent and action taken' });
	}
	return true; // Keeps the message channel open for asynchronous response
});

console.log('Background event handler loaded', new Date().toLocaleTimeString());
