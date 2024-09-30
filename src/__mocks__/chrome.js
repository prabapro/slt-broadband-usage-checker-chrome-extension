// src/__mocks__/chrome.js

export const chrome = {
	storage: {
		local: {
			get: jest.fn((keys, callback) => setTimeout(() => callback({}), 0)),
			set: jest.fn((data, callback) => setTimeout(callback, 0)),
		},
		session: {
			get: jest.fn((key, callback) => setTimeout(() => callback({}), 0)),
			set: jest.fn((data, callback) => setTimeout(callback, 0)),
		},
	},
	runtime: {
		lastError: null,
	},
};
