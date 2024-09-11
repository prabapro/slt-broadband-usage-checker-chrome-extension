import { formatSubscriberId } from '../utils/helpers.js';

// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
	console.log('Extension installed');
});

chrome.webRequest.onBeforeRequest.addListener(
	(details) => {
		if (details.url.includes('omniscapp.slt.lk')) {
			const url = new URL(details.url);
			const subscriberId = url.searchParams.get('subscriberID');
			if (subscriberId) {
				const formattedId = formatSubscriberId(subscriberId);
				chrome.storage.local.set({ subscriberId: formattedId });
				console.log('Captured and formatted subscriberId:', formattedId);
			}
		}
	},
	{ urls: ['https://omniscapp.slt.lk/*'] },
	['requestBody']
);

chrome.webRequest.onSendHeaders.addListener(
	(details) => {
		if (details.url.includes('omniscapp.slt.lk')) {
			const authHeader = details.requestHeaders.find(
				(h) => h.name.toLowerCase() === 'authorization'
			);
			const sltClientIdHeader = details.requestHeaders.find(
				(h) => h.name.toLowerCase() === 'x-ibm-client-id'
			);

			if (authHeader && sltClientIdHeader) {
				chrome.storage.local.set({
					authToken: authHeader.value,
					sltClientId: sltClientIdHeader.value,
				});
			}
		}
	},
	{ urls: ['https://omniscapp.slt.lk/*'] },
	['requestHeaders']
);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.action === 'getSubscriberId') {
		chrome.storage.local.get(['subscriberId'], (result) => {
			if (result.subscriberId) {
				sendResponse({ subscriberId: result.subscriberId });
			} else {
				// Fallback to content script method if not found in storage
				chrome.tabs.sendMessage(
					sender.tab.id,
					{ action: 'getSubscriberIdFromLocalStorage' },
					(response) => {
						if (response && response.subscriberId) {
							const formattedId = formatSubscriberId(response.subscriberId);
							chrome.storage.local.set({ subscriberId: formattedId });
							sendResponse({ subscriberId: formattedId });
						} else {
							sendResponse({ error: 'Failed to retrieve subscriberId' });
						}
					}
				);
			}
		});
		return true; // Indicates that the response will be sent asynchronously
	}
});

console.log('Background script loaded', new Date().toLocaleTimeString());
