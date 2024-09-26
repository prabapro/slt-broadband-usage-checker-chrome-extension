// src/utils/helpers.js

/**
 * Formats a subscriber ID to ensure it starts with '94'.
 * @param {string} id - The subscriber ID to format.
 * @returns {string} The formatted subscriber ID.
 */
export const formatSubscriberId = (id) => {
	if (id.startsWith('0')) return `94${id.slice(1)}`;
	if (id.startsWith('94')) return id;
	console.warn('Unexpected subscriberId format:', id);
	return id;
};

/**
 * Formats an account ID to ensure it starts with '0' instead of '94'.
 * @param {string} accountId - The account ID to format.
 * @returns {string} The formatted account ID.
 */
export const formatAccountId = (accountId) =>
	accountId.startsWith('94') ? `0${accountId.slice(2)}` : accountId;

/**
 * Formats the speed status into a readable string.
 * @param {string} status - The speed status to format.
 * @returns {string} The formatted speed status.
 */
export const formatSpeedStatus = (status) => {
	const lowerStatus = status.toLowerCase();
	if (lowerStatus === 'normal') return 'Speed is Normal';
	if (['throttle', 'throttled'].includes(lowerStatus))
		return 'Speed is Throttled';
	return `${status.charAt(0).toUpperCase()}${lowerStatus.slice(1)}`;
};

/**
 * Gets the CSS class for a given speed status.
 * @param {string} status - The speed status.
 * @returns {string} The corresponding CSS class.
 */
export const getStatusClass = (status) => {
	const lowerStatus = status.toLowerCase();
	if (lowerStatus === 'normal') return 'status-normal';
	if (['throttle', 'throttled'].includes(lowerStatus))
		return 'status-throttled';
	return 'status-other';
};

/**
 * Creates a data group element.
 * @param {string} serviceName - The name of the service.
 * @param {Array} items - The items to include in the data group.
 * @returns {HTMLElement} The created data group element.
 */
export const createDataGroup = (serviceName, items) => {
	const group = document.createElement('div');
	group.className = 'data-group';
	group.innerHTML = `<h2>${serviceName}</h2>`;
	items.forEach((item) => group.appendChild(createProgressBar(item)));
	return group;
};

/**
 * Calculates the percentage of a used amount relative to a total amount.
 * @param {number} used - The used amount.
 * @param {number} total - The total amount.
 * @returns {number} The calculated percentage.
 */
const calculatePercentage = (used, total) => (used / total) * 100;

/**
 * Formats a number to a specified number of decimal places.
 * @param {number} number - The number to format.
 * @param {number} [decimals=1] - The number of decimal places to round to.
 * @returns {string} The formatted number as a string.
 */
const formatNumber = (number, decimals = 1) => number.toFixed(decimals);

/**
 * Formats the expiry date from DD-MMM to MMM DD format.
 * @param {string} dateString - The date string in DD-MMM format (e.g., "30-Sep").
 * @returns {string} The formatted date string in MMM DD format (e.g., "Sep 30").
 */
const formatExpiryDate = (dateString) => {
	const [day, month] = dateString.split('-');
	return `${month} ${day}`;
};

/**
 * Gets the status text based on usage and remaining quota.
 * @param {boolean} isExceeded - Whether the quota is exceeded.
 * @param {number} remainingPercentage - The remaining percentage of the quota.
 * @param {string} remainingBalance - The remaining balance.
 * @param {string} quotaUnit - The unit of the quota (e.g., "GB").
 * @param {string} expiryDate - The expiry date of the quota.
 * @returns {string} The formatted status text.
 */
const getStatusText = (
	isExceeded,
	remainingPercentage,
	remainingBalance,
	quotaUnit,
	expiryDate
) => {
	if (isExceeded) return 'Quota exceeded';
	if (remainingPercentage === 0) return 'Quota fully used';
	const formattedExpiryDate = formatExpiryDate(expiryDate);
	return `<strong>${remainingBalance} ${quotaUnit}</strong> <small class="remaining-amount">(${formatNumber(
		remainingPercentage
	)}%) remaining till ${formattedExpiryDate}</small>`;
};

/**
 * Gets the CSS class for the progress bar fill based on the usage percentage.
 * @param {number} percentage - The usage percentage.
 * @returns {string} The CSS class for the progress bar fill.
 */
const getFillClass = (percentage) => {
	if (percentage >= 100) return 'fill-exceeded';
	if (percentage < 25) return 'fill-low';
	if (percentage < 50) return 'fill-medium';
	if (percentage < 75) return 'fill-high';
	return 'fill-very-high';
};

/**
 * Creates a progress bar element based on the provided data.
 * @param {Object} data - The data for the progress bar.
 * @param {string} data.used - The amount used.
 * @param {string} data.limit - The total limit.
 * @param {string} data.volume_unit - The unit of volume (e.g., "GB").
 * @param {string} data.name - The name of the data package.
 * @param {string} data.expiry_date - The expiry date of the package.
 * @returns {HTMLElement} The created progress bar element.
 */
const createProgressBar = (data) => {
	const {
		used,
		limit,
		volume_unit: quotaUnit,
		name,
		expiry_date: expiryDate,
	} = data;
	const usedAmount = parseFloat(used);
	const totalAmount = parseFloat(limit);
	const usedPercentage = calculatePercentage(usedAmount, totalAmount);
	const remainingBalance = formatNumber(
		Math.max(0, totalAmount - usedAmount),
		2
	);
	const remainingPercentage = Math.max(0, 100 - usedPercentage);

	const isExceeded = usedAmount > totalAmount;
	const isFullyUsed = usedAmount === totalAmount;
	const statusText = getStatusText(
		isExceeded,
		remainingPercentage,
		remainingBalance,
		quotaUnit,
		expiryDate
	);
	const fillClass = getFillClass(usedPercentage);

	const progressBar = document.createElement('div');
	progressBar.className = 'progress-bar';
	progressBar.innerHTML = `
	  <h3>${name}</h3>
	  <div class="bar">
		<div class="fill ${fillClass}" style="width: ${Math.min(
		usedPercentage,
		100
	)}%"></div>
	  </div>
	  <div class="progress-info">
		<span>
		  <span class="usage-amount">${formatNumber(usedAmount)} ${quotaUnit}</span>
		  <span class="total-amount"><small>of ${formatNumber(
				totalAmount
			)} ${quotaUnit} used</small></span>
		</span>
		<span class="${
			isExceeded || isFullyUsed ? 'exceeded' : ''
		}">${statusText}</span>
	  </div>
	`;

	return progressBar;
};
