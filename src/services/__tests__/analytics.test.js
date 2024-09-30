// src/services/__tests__/analytics.test.js

jest.mock('../analytics', () => {
	const originalModule = jest.requireActual('../analytics');
	return {
		...originalModule,
		SESSION_EXPIRATION_IN_MIN: 30,
	};
});

global.__GA4_MEASUREMENT_ID__ = 'test-ga4-id';
global.__GA4_API_SECRET__ = 'test-ga4-secret';
global.__APP_VERSION__ = 'test-version';

import {
	getOrCreateClientId,
	getOrCreateSessionId,
	sendPageView,
	sendEvent,
} from '../analytics';

// Mock chrome object
const mockChrome = {
	storage: {
		local: {
			get: jest.fn((keys, callback) => setTimeout(() => callback({}), 0)),
			set: jest.fn((data, callback) => setTimeout(() => callback(), 0)),
		},
		session: {
			get: jest.fn((key, callback) => setTimeout(() => callback({}), 0)),
			set: jest.fn((data, callback) => setTimeout(() => callback(), 0)),
		},
	},
};

// Replace global chrome with our mock
global.chrome = mockChrome;

describe('Analytics Service', () => {
	const originalFetch = global.fetch;
	let mockFetch;

	beforeEach(() => {
		mockFetch = jest.fn(() => Promise.resolve({ ok: true }));
		global.fetch = mockFetch;
		globalThis.crypto = {
			randomUUID: jest.fn(() => 'mocked-uuid'),
		};
	});

	afterEach(() => {
		global.fetch = originalFetch;
	});

	describe('getOrCreateClientId', () => {
		it('should return existing clientId if available', async () => {
			mockChrome.storage.local.get.mockImplementation((keys, callback) => {
				callback({ clientId: 'existing-client-id' });
			});

			const clientId = await getOrCreateClientId();
			expect(clientId).toBe('existing-client-id');
			expect(mockChrome.storage.local.set).not.toHaveBeenCalled();
		});

		it('should create and store new clientId if not available', async () => {
			mockChrome.storage.local.get.mockImplementation((keys, callback) => {
				callback({});
			});

			const clientId = await getOrCreateClientId();
			expect(clientId).toBe('mocked-uuid');
			expect(mockChrome.storage.local.set).toHaveBeenCalledWith(
				{ clientId: 'mocked-uuid' },
				expect.any(Function)
			);
		});
	});

	describe('getOrCreateSessionId', () => {
		beforeEach(() => {
			jest.spyOn(Date, 'now').mockImplementation(() => 1000000000000);
		});

		it('should return existing sessionId if not expired', async () => {
			const initialTimestamp = 1000000000000 - 1000000; // 1000 seconds ago
			mockChrome.storage.session.get.mockImplementationOnce((key, callback) =>
				setTimeout(
					() =>
						callback({
							sessionData: {
								session_id: 'existing-session-id',
								timestamp: initialTimestamp,
							},
						}),
					0
				)
			);

			const sessionId = await getOrCreateSessionId();
			expect(sessionId).toBe('existing-session-id');
			expect(mockChrome.storage.session.set).toHaveBeenCalledWith(
				{
					sessionData: {
						session_id: 'existing-session-id',
						timestamp: 1000000000000, // Updated timestamp
					},
				},
				expect.any(Function)
			);
		});

		it('should create new sessionId if expired', async () => {
			mockChrome.storage.session.get.mockImplementationOnce((key, callback) =>
				setTimeout(
					() =>
						callback({
							sessionData: {
								session_id: 'old-session-id',
								timestamp: 1000000000000 - 1800000000, // 30 minutes ago
							},
						}),
					0
				)
			);

			const sessionId = await getOrCreateSessionId();
			expect(sessionId).toBe('1000000000000');
			expect(mockChrome.storage.session.set).toHaveBeenCalledWith(
				{
					sessionData: {
						session_id: '1000000000000',
						timestamp: 1000000000000,
					},
				},
				expect.any(Function)
			);
		});
	});

	describe('sendPageView', () => {
		it('should send correct payload for page view', async () => {
			await sendPageView('Test Page', 'https://test.com');

			expect(mockFetch).toHaveBeenCalledWith(
				expect.stringContaining('google-analytics.com/mp/collect'),
				expect.objectContaining({
					method: 'POST',
					body: expect.stringContaining('"name":"page_view"'),
				})
			);

			const payload = JSON.parse(mockFetch.mock.calls[0][1].body);
			expect(payload.events[0].params).toEqual(
				expect.objectContaining({
					page_title: 'Test Page',
					page_location: 'https://test.com',
				})
			);
		});
	});

	describe('sendEvent', () => {
		it('should send correct payload for custom event', async () => {
			await sendEvent('test_event', { custom_param: 'value' });

			expect(mockFetch).toHaveBeenCalledWith(
				expect.stringContaining('google-analytics.com/mp/collect'),
				expect.objectContaining({
					method: 'POST',
					body: expect.stringContaining('"name":"test_event"'),
				})
			);

			const payload = JSON.parse(mockFetch.mock.calls[0][1].body);
			expect(payload.events[0].params).toEqual(
				expect.objectContaining({
					custom_param: 'value',
				})
			);
		});
	});

	describe('sendPageView - Additional Tests', () => {
		it('should handle network errors gracefully', async () => {
			global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
			console.error = jest.fn(); // Mock console.error

			await sendPageView('Test Page', 'https://test.com');

			expect(console.error).toHaveBeenCalledWith(
				'Error sending page view to GA4:',
				expect.any(Error)
			);
		});

		it('should handle non-OK responses', async () => {
			global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 400 });
			console.error = jest.fn(); // Mock console.error

			await sendPageView('Test Page', 'https://test.com');

			expect(console.error).toHaveBeenCalledWith(
				'Error sending page view to GA4:',
				expect.any(Error)
			);
		});
	});

	describe('sendEvent - Additional Tests', () => {
		it('should include engagement time in the payload', async () => {
			global.fetch = jest.fn().mockResolvedValue({ ok: true });

			await sendEvent('test_event', { custom_param: 'value' });

			const payload = JSON.parse(fetch.mock.calls[0][1].body);
			expect(payload.events[0].params).toHaveProperty('engagement_time_msec');
		});

		it('should handle events with no additional params', async () => {
			global.fetch = jest.fn().mockResolvedValue({ ok: true });

			await sendEvent('test_event');

			const payload = JSON.parse(fetch.mock.calls[0][1].body);
			expect(payload.events[0].name).toBe('test_event');
			expect(Object.keys(payload.events[0].params)).not.toContain(
				'custom_param'
			);
		});
	});
});
