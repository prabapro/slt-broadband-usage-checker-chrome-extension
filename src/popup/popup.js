import { formatSubscriberId } from '../utils/helpers.js';

const BASE_URL = 'https://omniscapp.slt.lk/mobitelint/slt/api/BBVAS';
const HELP_URL = 'mailto:prabapro+chromeapps@gmail.com';
const CACHE_DURATION = 60 * 60 * 1000; // 60 minutes in milliseconds
const USE_MOCK_DATA = false; // Set this to false to use real API data

// Mock data included directly in popup.js
const mockData = {
	reported_time: '10-Sep-2024 06:54 PM',
	usage_data: [
		{
			claim: null,
			expiry_date: '30-Sep',
			fetched_from: '/UsageSummary',
			limit: '440.0',
			name: 'Standard',
			percentage: 0,
			remaining: '0',
			service_name: 'Main Pack',
			subscriptionid: null,
			timestamp: 0,
			unsubscribable: false,
			used: '442.3',
			volume_unit: 'GB',
		},
		{
			claim: null,
			expiry_date: '30-Sep',
			fetched_from: '/UsageSummary',
			limit: '660.0',
			name: 'Total (Standard + Free)',
			percentage: 70,
			remaining: '700.0',
			service_name: 'Main Pack',
			subscriptionid: null,
			timestamp: 0,
			unsubscribable: false,
			used: '323.8',
			volume_unit: 'GB',
		},
		{
			claim: null,
			expiry_date: '01-Oct',
			fetched_from: '/BonusData',
			limit: 6,
			name: 'Loyalty',
			percentage: 0,
			remaining: 0,
			service_name: 'Bonus Data',
			subscriptionid: null,
			timestamp: 0,
			unsubscribable: false,
			used: 6,
			volume_unit: 'GB',
		},
		{
			claim: null,
			expiry_date: '05-Oct',
			fetched_from: '/ExtraGB',
			limit: 1024,
			name: 'My Extra GB',
			percentage: 50,
			remaining: 0,
			service_name: 'Extra GB',
			subscriptionid: null,
			timestamp: 0,
			unsubscribable: false,
			used: 1024,
			volume_unit: 'MB',
		},
		{
			claim: null,
			expiry_date: '10-Oct',
			fetched_from: '/GetDashboardVASBundles',
			limit: 20,
			name: '20 GB Add-on',
			percentage: 40,
			remaining: 12,
			service_name: 'Add-Ons Data',
			subscriptionid: null,
			timestamp: 0,
			unsubscribable: false,
			used: 8,
			volume_unit: 'GB',
		},
		{
			claim: null,
			expiry_date: '10-Oct',
			fetched_from: '/FreeData',
			limit: 3,
			name: '3GB Free Data',
			percentage: 50,
			remaining: 1.5,
			service_name: 'Free Data',
			subscriptionid: null,
			timestamp: 0,
			unsubscribable: false,
			used: 1.5,
			volume_unit: 'GB',
		},
	],
};

document.addEventListener('DOMContentLoaded', () => {
	document
		.getElementById('refresh-btn')
		.addEventListener('click', () => checkUsage(true));
	document
		.getElementById('reset-btn')
		.addEventListener('click', resetExtension);
	document.getElementById('help-btn').addEventListener('click', openHelpPage);
	checkAuthAndDisplay();
});

const checkAuthAndDisplay = async () => {
	const { authToken, clientId, subscriberId } = await new Promise((resolve) =>
		chrome.storage.local.get(['authToken', 'clientId', 'subscriberId'], resolve)
	);

	if (!authToken || !clientId || !subscriberId) {
		showWelcomeScreen();
	} else {
		checkUsage(false);
	}
};

const showWelcomeScreen = () => {
	const mainContent = document.querySelector('main');
	const accountId = document.getElementById('account-id');
	const lastUpdated = document.getElementById('last-updated');
	const refreshBtn = document.getElementById('refresh-btn');
	const resetBtn = document.getElementById('reset-btn');

	if (mainContent) mainContent.style.display = 'none';
	if (accountId) accountId.style.display = 'none';
	if (lastUpdated) lastUpdated.style.display = 'none';
	if (refreshBtn) refreshBtn.style.display = 'none';
	if (resetBtn) resetBtn.style.display = 'none';

	const welcomeScreen = document.createElement('div');
	welcomeScreen.id = 'welcome-screen';
	welcomeScreen.innerHTML = `
	  <h2>Hey 👋</h2>
	  <p>To get started, we need to fetch your session data from the MySLT Portal. Click the button below to open the MySLT Portal in a new tab.</p>
	  <p>If you're already logged in, simply opening the portal should be enough. If not, you'll need to log in to your account.</p>
	  <button id="welcome-login-btn">Open MySLT Portal</button>
	`;

	document.body.insertBefore(welcomeScreen, mainContent);

	document.getElementById('welcome-login-btn').addEventListener('click', () => {
		chrome.tabs.create({ url: 'https://myslt.slt.lk/' });
	});
};

let currentPage = 0;
let totalPages = 0;

const checkUsage = async (forceRefresh = false) => {
	console.log('checkUsage called, forceRefresh:', forceRefresh);
	clearError();

	try {
		const { authToken, clientId, cachedData, cacheTimestamp, subscriberId } =
			await new Promise((resolve) =>
				chrome.storage.local.get(
					[
						'authToken',
						'clientId',
						'cachedData',
						'cacheTimestamp',
						'subscriberId',
					],
					resolve
				)
			);

		const now = Date.now();
		console.log('Current time:', new Date(now).toISOString());
		console.log(
			'Cached timestamp:',
			cacheTimestamp
				? new Date(cacheTimestamp).toISOString()
				: 'No cached timestamp'
		);
		console.log(
			'Time since last cache:',
			cacheTimestamp ? `${(now - cacheTimestamp) / 1000} seconds` : 'N/A'
		);
		console.log('Cache duration:', `${CACHE_DURATION / 1000} seconds`);
		console.log('Stored subscriberId:', subscriberId);

		if (!authToken || !clientId || !subscriberId) {
			showWelcomeScreen();
			return;
		}

		if (
			!forceRefresh &&
			cachedData &&
			cacheTimestamp &&
			now - cacheTimestamp < CACHE_DURATION
		) {
			console.log('Using cached data');
			displayUsageData(cachedData, subscriberId);
		} else {
			console.log('Fetching fresh data');
			await fetchAllData(authToken, clientId, subscriberId);
		}
	} catch (error) {
		console.error('Error in checkUsage:', error);
		showError('An unexpected error occurred. Please try again later.');
	}
};

const fetchAllData = async (authToken, clientId, subscriberId) => {
	if (USE_MOCK_DATA) {
		const data = mockData;
		const timestamp = Date.now();
		await new Promise((resolve) =>
			chrome.storage.local.set(
				{
					cachedData: data,
					cacheTimestamp: timestamp,
					subscriberId: subscriberId || 'MockSubscriberId',
				},
				resolve
			)
		);
		console.log('Mock data and subscriberId cached successfully');
		displayUsageData(data, subscriberId || 'MockSubscriberId');
		return;
	}

	try {
		const [usageSummary, extraGB, bonusData, vasBundles, freeData] =
			await Promise.all([
				fetchUsageSummary(authToken, clientId, subscriberId),
				fetchExtraGB(authToken, clientId, subscriberId),
				fetchBonusData(authToken, clientId, subscriberId),
				fetchGetDashboardVASBundles(authToken, clientId, subscriberId),
				fetchFreeData(authToken, clientId, subscriberId),
			]);

		const combinedData = {
			reported_time: usageSummary.reported_time,
			usage_data: [
				...usageSummary.usage_data,
				...extraGB,
				...bonusData,
				...vasBundles,
				...freeData,
			],
		};

		console.log('Combined Data:', combinedData);

		const timestamp = Date.now();
		await new Promise((resolve) =>
			chrome.storage.local.set(
				{
					cachedData: combinedData,
					cacheTimestamp: timestamp,
					subscriberId,
				},
				resolve
			)
		);

		console.log('Combined data and subscriberId cached successfully');
		displayUsageData(combinedData, subscriberId);
	} catch (error) {
		console.error('Error fetching data:', error);
		showError(
			'Error fetching data. Your session might have expired. Please try re-login.'
		);
	}
};

const displayUsageData = (data, subscriberId) => {
	console.log('Displaying usage data');
	clearError();

	if (!data?.usage_data) {
		showError('Invalid usage data received');
		return;
	}

	updateAccountInfo(subscriberId);
	createUsageDataGroups(data.usage_data);
	updateLastUpdatedTime(data.reported_time);
};

const updateAccountInfo = (accountId) => {
	const accountIdElement = document.getElementById('account-id');
	if (accountIdElement) {
		accountIdElement.textContent = `Account: ${formatSubscriberId(accountId)}`;
	}
};

const createUsageDataGroups = (usageData) => {
	const usageContainer = document.getElementById('usage-data');
	if (!usageContainer) {
		console.error('Usage data container not found');
		return;
	}

	usageContainer.innerHTML = '';

	const groupedData = usageData.reduce((acc, item) => {
		if (!acc[item.service_name]) {
			acc[item.service_name] = [];
		}
		acc[item.service_name].push(item);
		return acc;
	}, {});

	Object.entries(groupedData).forEach(([serviceName, items], index) => {
		if (items.length > 0) {
			const group = createDataGroup(serviceName, items);
			group.classList.toggle('active', index === 0);
			usageContainer.appendChild(group);
		}
	});

	totalPages = usageContainer.children.length;
	updatePagination();
};

const createDataGroup = (serviceName, items) => {
	const group = document.createElement('div');
	group.className = 'data-group';
	group.innerHTML = `<h2>${serviceName}</h2>`;

	items.forEach((item) => {
		group.appendChild(createProgressBar(item));
	});

	return group;
};

const createProgressBar = (data) => {
	const usedAmount = parseFloat(data.used);
	const totalAmount = parseFloat(data.limit);
	const usedPercentage = (usedAmount / totalAmount) * 100;
	const remainingPercentage = Math.max(0, 100 - usedPercentage);

	const progressBar = document.createElement('div');
	progressBar.className = 'progress-bar';

	const isExceeded = usedAmount >= totalAmount;
	const statusText = isExceeded
		? 'Quota exceeded'
		: remainingPercentage === 0
		? 'Quota fully used'
		: `${remainingPercentage.toFixed(1)}% remaining till ${data.expiry_date}`;

	const fillClass = isExceeded
		? 'fill-exceeded'
		: usedPercentage < 25
		? 'fill-low'
		: usedPercentage < 50
		? 'fill-medium'
		: usedPercentage < 75
		? 'fill-high'
		: 'fill-very-high';

	progressBar.innerHTML = `
	  <h3>${data.name}</h3>
	  <div class="bar">
		<div class="fill ${fillClass}" style="width: ${Math.min(
		usedPercentage,
		100
	)}%"></div>
	  </div>
	  <div class="progress-info">
		<span>
		  <span class="usage-amount">${usedAmount.toFixed(1)} ${
		data.volume_unit
	}</span> / 
		  <span class="total-amount">${totalAmount.toFixed(1)} ${
		data.volume_unit
	}</span>
		</span>
		<span class="status-text ${isExceeded ? 'exceeded' : ''}">${statusText}</span>
	  </div>
	`;

	return progressBar;
};

const updatePagination = () => {
	const bulletsContainer = document.querySelector('.pagination-bullets');

	bulletsContainer.innerHTML = '';
	for (let i = 0; i < totalPages; i++) {
		const bullet = document.createElement('div');
		bullet.className = `bullet ${i === currentPage ? 'active' : ''}`;
		bullet.addEventListener('click', () => goToPage(i));
		bulletsContainer.appendChild(bullet);
	}
};

const goToPage = (pageNumber) => {
	if (pageNumber < 0 || pageNumber >= totalPages) return;

	const groups = document.querySelectorAll('.data-group');
	groups.forEach((group, index) => {
		group.classList.toggle('active', index === pageNumber);
	});

	currentPage = pageNumber;
	updatePagination();
};

const updateLastUpdatedTime = (reportedTime) => {
	const lastUpdatedTimeElement = document.getElementById('last-updated-time');
	const lastUpdatedRelativeElement = document.getElementById(
		'last-updated-relative'
	);

	if (!reportedTime) {
		lastUpdatedTimeElement.textContent = 'Last updated: Unknown';
		lastUpdatedRelativeElement.textContent = '';
		return;
	}

	const reportedDate = new Date(reportedTime);
	const now = new Date();

	// Format the reported time
	const formattedTime = reportedDate.toLocaleString('en-US', {
		hour: 'numeric',
		minute: 'numeric',
		hour12: true,
	});

	// Calculate the time difference in minutes
	const diffMinutes = Math.round((now - reportedDate) / (1000 * 60));

	lastUpdatedTimeElement.textContent = `Last updated: ${formattedTime}`;
	lastUpdatedRelativeElement.textContent = `(${diffMinutes} mins ago)`;
};

const updateUIForError = (showError) => {
	const elementsToHide = [
		document.getElementById('account-id'),
		document.querySelector('main'),
		document.getElementById('last-updated'),
		document.getElementById('refresh-btn'),
	];

	elementsToHide.forEach((element) => {
		if (element) {
			element.style.display = showError ? 'none' : '';
		}
	});

	const resetButton = document.getElementById('reset-btn');
	if (resetButton) {
		resetButton.textContent = 'Clear Data & Re-authenticate';
		resetButton.style.display = '';
	}

	const helpButton = document.getElementById('help-btn');
	if (helpButton) {
		helpButton.style.display = '';
	}
};

const showError = (message) => {
	console.log('Showing error:', message);
	const errorElement = document.getElementById('errorMessage');
	if (errorElement) {
		errorElement.textContent = message;
		errorElement.style.display = 'block';
	} else {
		console.error('Error message element not found');
	}

	updateUIForError(true);
};

const clearError = () => {
	const errorElement = document.getElementById('errorMessage');
	if (errorElement) {
		errorElement.textContent = '';
		errorElement.style.display = 'none';
	}

	const messageElement = document.getElementById('message');
	if (messageElement) {
		messageElement.textContent = '';
		messageElement.style.display = 'none';
	}

	updateUIForError(false);
};

const resetExtension = () => {
	console.log('Clearing stored data and preparing to re-authenticate');

	showMessage('Clearing extension data...', 'info');

	chrome.storage.local.remove(
		['authToken', 'clientId', 'cachedData', 'cacheTimestamp', 'subscriberId'],
		() => {
			if (chrome.runtime.lastError) {
				console.error('Error clearing data:', chrome.runtime.lastError);
				showMessage('Error clearing data. Please try again.', 'error');
			} else {
				showMessage('Data cleared. Please re-authenticate.', 'success');
				setTimeout(() => {
					showWelcomeScreen();
				}, 1500); // Wait for 1.5 seconds to show the success message
			}
		}
	);
};

const showMessage = (message, type = 'info') => {
	const messageElement = document.getElementById('message');
	if (messageElement) {
		messageElement.textContent = message;
		messageElement.className = `message ${type}`;
		messageElement.style.display = 'block';
	} else {
		console.error('Message element not found');
	}
};

const openHelpPage = () => {
	chrome.tabs.create({ url: HELP_URL });
};

const getSubscriberId = () =>
	new Promise((resolve) => {
		chrome.tabs.query({}, (tabs) => {
			const mySltTab = tabs.find((tab) => tab.url?.includes('myslt.slt.lk'));
			if (mySltTab) {
				chrome.tabs.sendMessage(
					mySltTab.id,
					{ action: 'getSubscriberId' },
					(response) => {
						if (chrome.runtime.lastError) {
							console.error(
								'Error getting subscriberId:',
								chrome.runtime.lastError
							);
							resolve(null);
						} else if (response?.subscriberId) {
							console.log('Retrieved subscriberId:', response.subscriberId);
							chrome.storage.local.set({ subscriberId: response.subscriberId });
							resolve(response.subscriberId);
						} else {
							console.log('No subscriberId in response');
							resolve(null);
						}
					}
				);
			} else {
				console.log('No MySLT tab found');
				resolve(null);
			}
		});
	});

// Helper function to reduce repetition in fetch calls
const fetchFromAPI = async (endpoint, authToken, clientId, subscriberId) => {
	const response = await fetch(
		`${BASE_URL}/${endpoint}?subscriberID=${subscriberId}`,
		{
			headers: {
				accept: 'application/json, text/plain, */*',
				authorization: authToken,
				'x-ibm-client-id': clientId,
			},
		}
	);
	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}
	return response.json();
};

const fetchUsageSummary = async (authToken, clientId, subscriberId) => {
	const data = await fetchFromAPI(
		'UsageSummary',
		authToken,
		clientId,
		subscriberId
	);
	return {
		reported_time: data.dataBundle.reported_time,
		usage_data: data.dataBundle.my_package_info.usageDetails.map((item) => ({
			...item,
			service_name: 'Main Pack',
			fetched_from: '/UsageSummary',
		})),
	};
};

const fetchExtraGB = async (authToken, clientId, subscriberId) => {
	const data = await fetchFromAPI('ExtraGB', authToken, clientId, subscriberId);
	return data.dataBundle.usageDetails.map((item) => ({
		...item,
		service_name: 'Extra GB',
		fetched_from: '/ExtraGB',
	}));
};

const fetchBonusData = async (authToken, clientId, subscriberId) => {
	const data = await fetchFromAPI(
		'BonusData',
		authToken,
		clientId,
		subscriberId
	);
	return data.dataBundle.usageDetails.map((item) => ({
		...item,
		service_name: 'Bonus Data',
		fetched_from: '/BonusData',
	}));
};

const fetchGetDashboardVASBundles = async (
	authToken,
	clientId,
	subscriberId
) => {
	const data = await fetchFromAPI(
		'GetDashboardVASBundles',
		authToken,
		clientId,
		subscriberId
	);
	return data.dataBundle.usageDetails.map((item) => ({
		...item,
		service_name: 'Add-Ons Data',
		fetched_from: '/GetDashboardVASBundles',
	}));
};

const fetchFreeData = async (authToken, clientId, subscriberId) => {
	const data = await fetchFromAPI(
		'FreeData',
		authToken,
		clientId,
		subscriberId
	);
	return data.dataBundle.usageDetails.map((item) => ({
		...item,
		service_name: 'Free Data',
		fetched_from: '/FreeData',
	}));
};

console.log('Popup script loaded', new Date().toLocaleTimeString());
console.log(`App version: ${__APP_VERSION__}`);
