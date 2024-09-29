// File: src/__mocks__/chrome.js

export const chrome = {
	storage: {
		local: {
			get: jest.fn(),
			set: jest.fn(),
		},
		session: {
			get: jest.fn(),
			set: jest.fn(),
		},
	},
	runtime: {
		sendMessage: jest.fn(),
		onMessage: {
			addListener: jest.fn(),
		},
	},
	tabs: {
		create: jest.fn(),
	},
};
