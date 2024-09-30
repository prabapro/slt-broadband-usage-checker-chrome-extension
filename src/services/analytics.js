// src/services/analytics.js

const GA4_MEASUREMENT_ID = __GA4_MEASUREMENT_ID__;
const GA4_API_SECRET = __GA4_API_SECRET__;
const GA4_ENDPOINT = `https://www.google-analytics.com/mp/collect?measurement_id=${GA4_MEASUREMENT_ID}&api_secret=${GA4_API_SECRET}`;
const DEFAULT_ENGAGEMENT_TIME_IN_MSEC = 100;
export let SESSION_EXPIRATION_IN_MIN = 30;

// The display version will be injected by Vite
const DISPLAY_VERSION = __APP_VERSION__;

// Generate a unique client ID for each extension installation
export const generateUUID =
	process.env.NODE_ENV === 'test'
		? () => 'mocked-uuid'
		: () =>
				'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
					var r = (Math.random() * 16) | 0,
						v = c == 'x' ? r : (r & 0x3) | 0x8;
					return v.toString(16);
				});

export async function getOrCreateClientId() {
	return new Promise((resolve, reject) => {
		chrome.storage.local.get(['clientId'], (result) => {
			if (chrome.runtime.lastError) {
				reject(new Error(chrome.runtime.lastError.message));
				return;
			}
			if (result.clientId) {
				resolve(result.clientId);
			} else {
				const newClientId = generateUUID();
				chrome.storage.local.set({ clientId: newClientId }, () => {
					if (chrome.runtime.lastError) {
						reject(new Error(chrome.runtime.lastError.message));
					} else {
						resolve(newClientId);
					}
				});
			}
		});
	});
}

export function setSessionExpirationTime(minutes) {
	SESSION_EXPIRATION_IN_MIN = minutes;
}

// Get or create a session ID
export async function getOrCreateSessionId() {
	return new Promise((resolve, reject) => {
		chrome.storage.session.get('sessionData', (result) => {
			if (chrome.runtime.lastError) {
				reject(new Error(chrome.runtime.lastError.message));
				return;
			}
			const currentTimeInMs = Date.now();
			let sessionData = result.sessionData;

			const createNewSession = () => ({
				session_id: currentTimeInMs.toString(),
				timestamp: currentTimeInMs,
			});

			if (!sessionData || !sessionData.timestamp) {
				sessionData = createNewSession();
			} else {
				const durationInMin = (currentTimeInMs - sessionData.timestamp) / 60000;
				if (durationInMin > SESSION_EXPIRATION_IN_MIN) {
					sessionData = createNewSession();
				}
			}

			chrome.storage.session.set({ sessionData }, () => {
				if (chrome.runtime.lastError) {
					reject(new Error(chrome.runtime.lastError.message));
				} else {
					resolve(sessionData.session_id);
				}
			});
		});
	});
}

// Send page view event to GA4
export async function sendPageView(pageTitle, pageLocation) {
	const clientId = await getOrCreateClientId();
	const sessionId = await getOrCreateSessionId();

	const payload = {
		client_id: clientId,
		events: [
			{
				name: 'page_view',
				params: {
					session_id: sessionId,
					engagement_time_msec: DEFAULT_ENGAGEMENT_TIME_IN_MSEC,
					page_title: pageTitle,
					page_location: pageLocation,
					app_version: DISPLAY_VERSION,
				},
			},
		],
	};

	try {
		const response = await fetch(GA4_ENDPOINT, {
			method: 'POST',
			body: JSON.stringify(payload),
		});

		if (!response.ok) {
			throw new Error('GA4 page_view request failed');
		}

		console.log('Page view sent to GA4:', pageTitle, {
			app_version: DISPLAY_VERSION,
		});
	} catch (error) {
		console.error('Error sending page view to GA4:', error);
	}
}

// Send event to GA4
export async function sendEvent(name, params = {}) {
	const clientId = await getOrCreateClientId();
	const sessionId = await getOrCreateSessionId();

	const payload = {
		client_id: clientId,
		events: [
			{
				name,
				params: {
					...params,
					session_id: sessionId,
					engagement_time_msec: DEFAULT_ENGAGEMENT_TIME_IN_MSEC,
					app_version: DISPLAY_VERSION,
				},
			},
		],
	};

	try {
		const response = await fetch(GA4_ENDPOINT, {
			method: 'POST',
			body: JSON.stringify(payload),
		});

		if (!response.ok) {
			throw new Error('GA4 request failed');
		}

		console.log('Event sent to GA4:', name, {
			...params,
			app_version: DISPLAY_VERSION,
		});
	} catch (error) {
		console.error('Error sending event to GA4:', error);
	}
}
