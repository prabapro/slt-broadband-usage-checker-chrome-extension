// Subscriber ID formatting
export function formatSubscriberId(id) {
	if (id.startsWith('0')) return '94' + id.substring(1);
	if (id.startsWith('94')) return id;
	console.warn('Unexpected subscriberId format:', id);
	return id;
}

export function formatAccountId(accountId) {
	return accountId.startsWith('94') ? '0' + accountId.slice(2) : accountId;
}

// Speed status formatting
export function formatSpeedStatus(status) {
	const lowerStatus = status.toLowerCase();
	if (lowerStatus === 'normal') return 'Speed is Normal';
	if (['throttle', 'throttled'].includes(lowerStatus))
		return 'Speed is Throttled';
	return status.charAt(0).toUpperCase() + lowerStatus.slice(1);
}

export function getStatusClass(status) {
	const lowerStatus = status.toLowerCase();
	if (lowerStatus === 'normal') return 'status-normal';
	if (['throttle', 'throttled'].includes(lowerStatus))
		return 'status-throttled';
	return 'status-other';
}

// Data group creation
export function createDataGroup(serviceName, items) {
	const group = document.createElement('div');
	group.className = 'data-group';
	group.innerHTML = `<h2>${serviceName}</h2>`;
	items.forEach((item) => group.appendChild(createProgressBar(item)));
	return group;
}

// Helper functions for createProgressBar
const calculatePercentage = (used, total) => (used / total) * 100;
const formatNumber = (number, decimals = 1) => number.toFixed(decimals);

const getStatusText = (
	isExceeded,
	remainingPercentage,
	remainingBalance,
	quotaUnit,
	expiryDate
) => {
	if (isExceeded) return 'Quota exceeded';
	if (remainingPercentage === 0) return 'Quota fully used';
	return `<strong>${remainingBalance} ${quotaUnit}</strong> (${formatNumber(
		remainingPercentage
	)}%) remaining till ${expiryDate}`;
};

const getFillClass = (percentage) => {
	if (percentage >= 100) return 'fill-exceeded';
	if (percentage < 25) return 'fill-low';
	if (percentage < 50) return 'fill-medium';
	if (percentage < 75) return 'fill-high';
	return 'fill-very-high';
};

// Progress bar creation
function createProgressBar(data) {
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
	const remainingBalance = formatNumber(totalAmount - usedAmount, 2);
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
		  <span class="usage-amount">${formatNumber(usedAmount)} ${quotaUnit}</span> / 
		  <span class="total-amount">${formatNumber(totalAmount)} ${quotaUnit}</span>
		</span>
		<span class="status-text ${
			isExceeded ? 'exceeded' : isFullyUsed ? 'exceeded' : ''
		}">${statusText}</span>
	  </div>
	`;

	return progressBar;
}
