// src/services/analytics.js

const GA4_MEASUREMENT_ID = __GA4_MEASUREMENT_ID__;
const GA4_API_SECRET = __GA4_API_SECRET__;
const GA4_ENDPOINT = `https://www.google-analytics.com/mp/collect?measurement_id=${GA4_MEASUREMENT_ID}&api_secret=${GA4_API_SECRET}`;
const SESSION_EXPIRATION_IN_MIN = 30;
const DEFAULT_ENGAGEMENT_TIME_IN_MSEC = 100;

// The display version will be injected by Vite
const DISPLAY_VERSION = __APP_VERSION__;

// Generate a unique client ID for each extension installation
const generateUUID =
	process.env.NODE_ENV === 'test'
		? () => 'mocked-uuid'
		: () =>
				'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
					var r = (Math.random() * 16) | 0,
						v = c == 'x' ? r : (r & 0x3) | 0x8;
					return v.toString(16);
				});

export function getOrCreateClientId() {
	return new Promise((resolve) => {
		chrome.storage.local.get(['clientId'], (result) => {
			if (result.clientId) {
				resolve(result.clientId);
			} else {
				const newClientId = generateUUID();
				chrome.storage.local.set({ clientId: newClientId }, () => {
					resolve(newClientId);
				});
			}
		});
	});
}

// Get or create a session ID
export async function getOrCreateSessionId() {
	return new Promise((resolve) => {
		chrome.storage.session.get('sessionData', (result) => {
			const currentTimeInMs = Date.now();
			let sessionData = result.sessionData;

			if (sessionData && sessionData.timestamp) {
				const durationInMin = (currentTimeInMs - sessionData.timestamp) / 60000;
				if (durationInMin > SESSION_EXPIRATION_IN_MIN) {
					sessionData = null;
				} else {
					// Update the timestamp for existing sessions
					sessionData.timestamp = currentTimeInMs;
				}
			}

			if (!sessionData) {
				sessionData = {
					session_id: currentTimeInMs.toString(),
					timestamp: currentTimeInMs,
				};
			}

			chrome.storage.session.set({ sessionData }, () => {
				resolve(sessionData.session_id);
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
