const GA4_MEASUREMENT_ID = __GA4_MEASUREMENT_ID__;
const GA4_API_SECRET = __GA4_API_SECRET__;
const GA4_ENDPOINT = `https://www.google-analytics.com/mp/collect?measurement_id=${GA4_MEASUREMENT_ID}&api_secret=${GA4_API_SECRET}`;
const SESSION_EXPIRATION_IN_MIN = 30;
const DEFAULT_ENGAGEMENT_TIME_IN_MSEC = 100;

// Generate a unique client ID for each extension installation
function getOrCreateClientId() {
	return new Promise((resolve) => {
		chrome.storage.local.get(['clientId'], (result) => {
			if (result.clientId) {
				resolve(result.clientId);
			} else {
				const newClientId = self.crypto.randomUUID();
				chrome.storage.local.set({ clientId: newClientId }, () => {
					resolve(newClientId);
				});
			}
		});
	});
}

// Get or create a session ID
async function getOrCreateSessionId() {
	let { sessionData } = await chrome.storage.session.get('sessionData');
	const currentTimeInMs = Date.now();

	if (sessionData && sessionData.timestamp) {
		const durationInMin = (currentTimeInMs - sessionData.timestamp) / 60000;
		if (durationInMin > SESSION_EXPIRATION_IN_MIN) {
			sessionData = null;
		} else {
			sessionData.timestamp = currentTimeInMs;
			await chrome.storage.session.set({ sessionData });
		}
	}

	if (!sessionData) {
		sessionData = {
			session_id: currentTimeInMs.toString(),
			timestamp: currentTimeInMs,
		};
		await chrome.storage.session.set({ sessionData });
	}

	return sessionData.session_id;
}

// Send page view event to GA4
async function sendPageView(pageTitle, pageLocation) {
	const version = chrome.runtime.getManifest().version;
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
					app_version: version,
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

		console.log('Page view sent to GA4:', pageTitle, { app_version: version });
	} catch (error) {
		console.error('Error sending page view to GA4:', error);
	}
}

// Send event to GA4
async function sendEvent(name, params = {}) {
	const version = chrome.runtime.getManifest().version;
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
					app_version: version,
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
			app_version: version,
		});
	} catch (error) {
		console.error('Error sending event to GA4:', error);
	}
}

export { sendPageView, sendEvent };
