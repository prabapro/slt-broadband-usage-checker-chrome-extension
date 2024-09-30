// src/services/__tests__/analytics.test.js

import { chrome } from '../../__mocks__/chrome';
import {
	getOrCreateClientId,
	getOrCreateSessionId,
	sendPageView,
	sendEvent,
	setSessionExpirationTime,
} from '../analytics';

// Mock chrome globally
global.chrome = chrome;

// Mock fetch globally
global.fetch = jest.fn(() => Promise.resolve({ ok: true }));

// Mock __GA4_MEASUREMENT_ID__ and __GA4_API_SECRET__
global.__GA4_MEASUREMENT_ID__ = 'test-ga4-id';
global.__GA4_API_SECRET__ = 'test-ga4-secret';

// Mock SESSION_EXPIRATION_IN_MIN
jest.mock('../analytics', () => {
	const originalModule = jest.requireActual('../analytics');
	return {
		...originalModule,
		SESSION_EXPIRATION_IN_MIN: 1 / 60, // 1 second for testing
	};
});
describe('Analytics Service', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		chrome.runtime.lastError = null;
		setSessionExpirationTime(1 / 60); // Set to 1 second for testing
	});

	describe('getOrCreateClientId', () => {
		it('should return existing clientId if available', async () => {
			chrome.storage.local.get.mockImplementationOnce((keys, callback) => {
				callback({ clientId: 'existing-client-id' });
			});

			const clientId = await getOrCreateClientId();
			expect(clientId).toBe('existing-client-id');
			expect(chrome.storage.local.set).not.toHaveBeenCalled();
		});

		it('should create and store new clientId if not available', async () => {
			chrome.storage.local.get.mockImplementationOnce((keys, callback) => {
				callback({});
			});

			const clientId = await getOrCreateClientId();
			expect(clientId).toBe('mocked-uuid');
			expect(chrome.storage.local.set).toHaveBeenCalledWith(
				{ clientId: 'mocked-uuid' },
				expect.any(Function)
			);
		});

		it('should handle storage errors', async () => {
			chrome.storage.local.get.mockImplementationOnce((keys, callback) => {
				chrome.runtime.lastError = { message: 'Storage error' };
				callback({});
			});

			await expect(getOrCreateClientId()).rejects.toThrow('Storage error');
		});
	});

	describe('getOrCreateSessionId', () => {
		it('should return existing sessionId if not expired', async () => {
			const now = 1627684714494;
			jest.spyOn(Date, 'now').mockImplementation(() => now);

			chrome.storage.session.get.mockImplementationOnce((key, callback) => {
				callback({
					sessionData: {
						session_id: 'existing-session-id',
						timestamp: now - 500, // 500ms ago, less than 1 second (our mocked expiration time)
					},
				});
			});

			const sessionId = await getOrCreateSessionId();
			expect(sessionId).toBe('existing-session-id');
		});

		it('should create new sessionId if expired', async () => {
			const now = 1627684714494;
			jest.spyOn(Date, 'now').mockImplementation(() => now);

			chrome.storage.session.get.mockImplementationOnce((key, callback) => {
				callback({
					sessionData: {
						session_id: 'old-session-id',
						timestamp: now - 2000, // 2 seconds ago, more than our mocked expiration time (1 second)
					},
				});
			});

			let storedSessionData;
			chrome.storage.session.set.mockImplementationOnce((data, callback) => {
				storedSessionData = data.sessionData;
				callback();
			});

			const sessionId = await getOrCreateSessionId();

			expect(sessionId).toBe(now.toString());
			expect(storedSessionData).toEqual({
				session_id: now.toString(),
				timestamp: now,
			});
		});

		it('should create new sessionId if no existing session', async () => {
			const now = 1627684714494;
			jest.spyOn(Date, 'now').mockImplementation(() => now);

			chrome.storage.session.get.mockImplementationOnce((key, callback) => {
				callback({}); // No existing sessionData
			});

			let storedSessionData;
			chrome.storage.session.set.mockImplementationOnce((data, callback) => {
				storedSessionData = data.sessionData;
				callback();
			});

			const sessionId = await getOrCreateSessionId();
			expect(sessionId).toBe(now.toString());
			expect(storedSessionData).toEqual({
				session_id: now.toString(),
				timestamp: now,
			});
		});

		it('should handle storage errors', async () => {
			chrome.storage.session.get.mockImplementationOnce((key, callback) => {
				chrome.runtime.lastError = { message: 'Session storage error' };
				callback({});
			});

			await expect(getOrCreateSessionId()).rejects.toThrow(
				'Session storage error'
			);
		});
	});

	describe('sendPageView', () => {
		it('should send correct payload for page view', async () => {
			await sendPageView('Test Page', 'https://test.com');

			expect(fetch).toHaveBeenCalledWith(
				expect.stringContaining('google-analytics.com/mp/collect'),
				expect.objectContaining({
					method: 'POST',
					body: expect.stringContaining('"name":"page_view"'),
				})
			);
		});

		it('should handle network errors gracefully', async () => {
			global.fetch.mockRejectedValueOnce(new Error('Network error'));
			console.error = jest.fn();

			await sendPageView('Test Page', 'https://test.com');

			expect(console.error).toHaveBeenCalledWith(
				'Error sending page view to GA4:',
				expect.any(Error)
			);
		});

		it('should handle non-OK responses', async () => {
			global.fetch.mockResolvedValueOnce({ ok: false, status: 400 });
			console.error = jest.fn();

			await sendPageView('Test Page', 'https://test.com');

			expect(console.error).toHaveBeenCalledWith(
				'Error sending page view to GA4:',
				expect.any(Error)
			);
		});
	});

	describe('sendEvent', () => {
		it('should send correct payload for custom event', async () => {
			await sendEvent('test_event', { custom_param: 'value' });

			expect(fetch).toHaveBeenCalledWith(
				expect.stringContaining('google-analytics.com/mp/collect'),
				expect.objectContaining({
					method: 'POST',
					body: expect.stringContaining('"name":"test_event"'),
				})
			);
		});

		it('should include engagement time in the payload', async () => {
			await sendEvent('test_event', { custom_param: 'value' });

			const [[, { body }]] = fetch.mock.calls;
			const payload = JSON.parse(body);
			expect(payload.events[0].params).toHaveProperty('engagement_time_msec');
		});

		it('should handle events with no additional params', async () => {
			await sendEvent('test_event');

			const [[, { body }]] = fetch.mock.calls;
			const payload = JSON.parse(body);
			expect(payload.events[0].name).toBe('test_event');
			expect(Object.keys(payload.events[0].params)).not.toContain(
				'custom_param'
			);
		});

		it('should handle network errors gracefully', async () => {
			global.fetch.mockRejectedValueOnce(new Error('Network error'));
			console.error = jest.fn();

			await sendEvent('test_event');

			expect(console.error).toHaveBeenCalledWith(
				'Error sending event to GA4:',
				expect.any(Error)
			);
		});
	});
});
