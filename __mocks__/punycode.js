// File: __mocks__/punycode.js

module.exports = {
	// Add any methods from punycode that your code might be using
	// For example:
	toASCII: jest.fn((domain) => domain),
	toUnicode: jest.fn((domain) => domain),
};
