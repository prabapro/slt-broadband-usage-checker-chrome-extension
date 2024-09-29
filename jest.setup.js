// jest.setup.js

import '@testing-library/jest-dom';

global.__APP_VERSION__ = 'test-version';
global.__GA4_MEASUREMENT_ID__ = 'test-ga4-id';
global.__GA4_API_SECRET__ = 'test-ga4-secret';
global.__USE_MOCK_DATA__ = true;

// Add TextEncoder and TextDecoder to the global scope
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Suppress the punycode deprecation warning
const originalWarn = console.warn;
console.warn = (...args) => {
	if (args[0] && args[0].includes('The `punycode` module is deprecated')) {
		return;
	}
	originalWarn(...args);
};
