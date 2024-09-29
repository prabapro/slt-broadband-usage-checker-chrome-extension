// File: jest.config.js

export default {
	testEnvironment: 'jsdom',
	transform: {
		'^.+\\.js$': 'babel-jest',
	},
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/src/$1',
		'^punycode$': '<rootDir>/__mocks__/punycode.js',
	},
	setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
	transformIgnorePatterns: ['/node_modules/(?!punycode)/'],
	testEnvironmentOptions: {
		customExportConditions: ['node', 'node-addons'],
	},
};