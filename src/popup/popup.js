const BASE_URL = 'https://omniscapp.slt.lk/mobitelint/slt/api/BBVAS';
const SUPPORT_URL =
	'https://chromewebstore.google.com/detail/slt-broadband-usage-check/cdmfcngnfgnhddcheambbdjdjmelnoep/support';
const REVIEW_URL =
	'https://chromewebstore.google.com/detail/slt-broadband-usage-check/cdmfcngnfgnhddcheambbdjdjmelnoep/reviews';
const CACHE_DURATION = 60 * 60 * 1000; // 60 minutes in milliseconds
const USE_MOCK_DATA = false; // Set this to false to use real API data

// Mock data included directly in popup.js
const mockData = {
	reported_time: '10-Sep-2024 06:54 PM',
	speed_status: 'NORMAL',
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

// Update the sendPageView function
const sendPageView = (pageTitle) => {
	chrome.runtime.sendMessage({
		action: 'sendPageView',
		pageTitle,
		pageLocation: document.location.href,
	});
};

// Update the sendEvent function
const sendEvent = (eventName, eventParams = {}) => {
	chrome.runtime.sendMessage({
		action: 'sendEvent',
		eventName,
		eventParams,
	});
};

document.addEventListener('DOMContentLoaded', () => {
	document.getElementById('refresh-btn').addEventListener('click', () => {
		sendEvent('refresh_clicked');
		checkUsage(true);
	});
	document.getElementById('reset-btn').addEventListener('click', () => {
		resetExtension();
	});
	document.getElementById('support-link').addEventListener('click', (e) => {
		e.preventDefault();
		openSupportPage();
	});

	document.getElementById('review-link').addEventListener('click', (e) => {
		e.preventDefault();
		openReviewPage();
	});
	checkAuthAndDisplay();

	// Send page view event
	sendPageView('SLT Usage Checker Popup');
});

let currentPage = 0;
let totalPages = 0;

const checkAuthAndDisplay = async () => {
	const { authToken, sltClientId, subscriberId } = await new Promise(
		(resolve) =>
			chrome.storage.local.get(
				['authToken', 'sltClientId', 'subscriberId'],
				resolve
			)
	);

	if (!authToken || !sltClientId || !subscriberId) {
		showWelcomeScreen();
	} else {
		checkUsage(false);
	}
};

const showWelcomeScreen = () => {
	const elementsToHide = [
		document.querySelector('main'),
		document.getElementById('account-info'),
		document.getElementById('account-id'),
		document.getElementById('last-updated'),
		document.getElementById('refresh-btn'),
		document.getElementById('reset-btn'),
	];

	elementsToHide.forEach((element) => {
		if (element) element.style.display = 'none';
	});

	const welcomeScreen = document.createElement('div');
	welcomeScreen.id = 'welcome-screen';
	welcomeScreen.innerHTML = `
        <h2>Hey 👋</h2>
        <p>To get started, we need to fetch your session data from the MySLT Portal. Follow these steps:</p>
        <div id="welcome-instructions">
			<ol>
				<li>Click the button below to open the MySLT Portal in a new tab.</li>
				<li>Log in to your account if needed.</li>
				<li>After logging in, close the MySLT Portal tab.</li>
				<li>Click on this extension icon again to view your data usage.</li>
			</ol>
		</div>
        <button id="welcome-login-btn">Open MySLT Portal</button>
    `;

	document.body.insertBefore(welcomeScreen, document.querySelector('main'));

	document.getElementById('welcome-login-btn').addEventListener('click', () => {
		chrome.runtime.sendMessage({
			action: 'sendEvent',
			eventName: 'welcome_login_clicked',
			eventParams: {},
			url: 'https://myslt.slt.lk/',
		});
	});

	// Send page view event for welcome screen
	sendPageView('SLT Usage Checker Welcome Screen');
};

const checkUsage = async (forceRefresh = false) => {
	console.log('checkUsage called, forceRefresh:', forceRefresh);
	clearError();

	try {
		const { authToken, sltClientId, cachedData, cacheTimestamp, subscriberId } =
			await new Promise((resolve) =>
				chrome.storage.local.get(
					[
						'authToken',
						'sltClientId',
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

		if (!authToken || !sltClientId || !subscriberId) {
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
			sendEvent('usage_checked', { data_source: 'cache' });
			displayUsageData(cachedData, subscriberId);
		} else {
			console.log('Fetching fresh data');
			sendEvent('usage_checked', { data_source: 'api' });
			await fetchAllData(authToken, sltClientId, subscriberId);
		}
	} catch (error) {
		console.error('Error in checkUsage:', error);
		sendEvent('error', { error_type: 'check_usage_error' });
		showError('An unexpected error occurred. Please try again later.');
	}
};

const fetchAllData = async (authToken, sltClientId, subscriberId) => {
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
				fetchUsageSummary(authToken, sltClientId, subscriberId),
				fetchExtraGB(authToken, sltClientId, subscriberId),
				fetchBonusData(authToken, sltClientId, subscriberId),
				fetchGetDashboardVASBundles(authToken, sltClientId, subscriberId),
				fetchFreeData(authToken, sltClientId, subscriberId),
			]);

		const combinedData = {
			reported_time: usageSummary.reported_time,
			speed_status: usageSummary.speed_status,
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
		sendEvent('error', { error_type: 'data_fetch_error' });
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

	updateAccountInfo(subscriberId, data.speed_status);
	createUsageDataGroups(data.usage_data);
	updateLastUpdatedTime(data.reported_time);

	// Send page view event for usage data screen
	sendPageView('SLT Usage Data Screen');
};

const formatAccountId = (accountId) => {
	if (accountId.startsWith('94')) {
		return '0' + accountId.slice(2);
	}
	return accountId;
};

const updateAccountInfo = (accountId, speedStatus) => {
	const accountIdElement = document.getElementById('account-id');
	const speedStatusElement = document.getElementById('speed-status');

	if (accountIdElement) {
		const formattedId = formatAccountId(accountId);
		accountIdElement.textContent = `Account: ${formattedId}`;
		console.log('Formatted Account ID:', formattedId);
	}

	if (speedStatusElement && speedStatus) {
		const formattedStatus = formatSpeedStatus(speedStatus);
		speedStatusElement.textContent = formattedStatus;
		speedStatusElement.className = `status-pill ${getStatusClass(speedStatus)}`;
		console.log('Speed Status:', formattedStatus);

		// Send GA4 event for speed status
		sendEvent('speed_status_checked', {
			speed_status: speedStatus.toLowerCase(),
		});
	}
};

const formatSpeedStatus = (status) => {
	status = status.toLowerCase();
	if (status === 'normal') {
		return 'Speed is Normal';
	} else if (status === 'throttle' || status === 'throttled') {
		return 'Speed is Throttled';
	} else {
		return status.charAt(0).toUpperCase() + status.slice(1);
	}
};

const getStatusClass = (status) => {
	status = status.toLowerCase();
	if (status === 'normal') {
		return 'status-normal';
	} else if (status === 'throttle' || status === 'throttled') {
		return 'status-throttled';
	} else {
		return 'status-other';
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
			group.dataset.groupName = serviceName;
			group.dataset.bandName = items[0].name; // Store the 'name' property
			usageContainer.appendChild(group);
		}
	});

	totalPages = usageContainer.children.length;
	updatePagination();

	// Send event for the initially viewed group
	if (totalPages > 0) {
		const initialGroup = usageContainer.children[0];
		sendEvent('group_viewed', {
			group_name: initialGroup.dataset.groupName,
			band_name: initialGroup.dataset.bandName,
		});
	}
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
      <span class="status-text ${
				isExceeded ? 'exceeded' : ''
			}">${statusText}</span>
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
		const isActive = index === pageNumber;
		group.classList.toggle('active', isActive);
		if (isActive) {
			sendEvent('group_viewed', {
				group_name: group.dataset.groupName,
				band_name: group.dataset.bandName,
			});
		}
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
	showMessage('Clearing extension data...', 'info');

	chrome.runtime.sendMessage({ action: 'resetExtension' }, (response) => {
		if (response.status === 'error') {
			console.error('Error clearing data:', response.message);
			showMessage('Error clearing data. Please try again.', 'error');
		} else {
			showMessage('Data cleared. Please re-authenticate.', 'success');
			setTimeout(() => {
				showWelcomeScreen();
			}, 1500);
		}
	});
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

const openSupportPage = () => {
	chrome.runtime.sendMessage({
		action: 'sendEvent',
		eventName: 'support_page_opened',
		eventParams: {},
		url: SUPPORT_URL,
	});
};

const openReviewPage = () => {
	chrome.runtime.sendMessage({
		action: 'sendEvent',
		eventName: 'review_page_opened',
		eventParams: {},
		url: REVIEW_URL,
	});
};

// Helper function to reduce repetition in fetch calls
const fetchFromAPI = async (endpoint, authToken, sltClientId, subscriberId) => {
	try {
		const response = await fetch(
			`${BASE_URL}/${endpoint}?subscriberID=${subscriberId}`,
			{
				headers: {
					accept: 'application/json, text/plain, */*',
					authorization: authToken,
					'x-ibm-client-id': sltClientId,
				},
			}
		);
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		return response.json();
	} catch (error) {
		sendEvent('error', {
			error_type: 'api_fetch_error',
			error_message: error.message,
			endpoint: endpoint,
		});
		throw error; // Re-throw the error to be handled by the caller
	}
};

const fetchUsageSummary = async (authToken, sltClientId, subscriberId) => {
	const data = await fetchFromAPI(
		'UsageSummary',
		authToken,
		sltClientId,
		subscriberId
	);
	return {
		reported_time: data.dataBundle.reported_time,
		speed_status: data.dataBundle.status,
		usage_data: data.dataBundle.my_package_info.usageDetails.map((item) => ({
			...item,
			service_name: 'Main Pack',
			fetched_from: '/UsageSummary',
		})),
	};
};

const fetchExtraGB = async (authToken, sltClientId, subscriberId) => {
	const data = await fetchFromAPI(
		'ExtraGB',
		authToken,
		sltClientId,
		subscriberId
	);
	return data.dataBundle.usageDetails.map((item) => ({
		...item,
		service_name: 'Extra GB',
		fetched_from: '/ExtraGB',
	}));
};

const fetchBonusData = async (authToken, sltClientId, subscriberId) => {
	const data = await fetchFromAPI(
		'BonusData',
		authToken,
		sltClientId,
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
	sltClientId,
	subscriberId
) => {
	const data = await fetchFromAPI(
		'GetDashboardVASBundles',
		authToken,
		sltClientId,
		subscriberId
	);
	return data.dataBundle.usageDetails.map((item) => ({
		...item,
		service_name: 'Add-Ons Data',
		fetched_from: '/GetDashboardVASBundles',
	}));
};

const fetchFreeData = async (authToken, sltClientId, subscriberId) => {
	const data = await fetchFromAPI(
		'FreeData',
		authToken,
		sltClientId,
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
