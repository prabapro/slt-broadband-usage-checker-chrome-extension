// src/utils/helpers.js

export function formatSubscriberId(id) {
	if (id.startsWith('0')) {
		return '94' + id.substring(1);
	} else if (id.startsWith('94')) {
		return id;
	} else {
		console.warn('Unexpected subscriberId format:', id);
		return id;
	}
}

export function formatAccountId(accountId) {
	if (accountId.startsWith('94')) {
		return '0' + accountId.slice(2);
	}
	return accountId;
}

export function formatSpeedStatus(status) {
	status = status.toLowerCase();
	if (status === 'normal') {
		return 'Speed is Normal';
	} else if (status === 'throttle' || status === 'throttled') {
		return 'Speed is Throttled';
	} else {
		return status.charAt(0).toUpperCase() + status.slice(1);
	}
}

export function getStatusClass(status) {
	status = status.toLowerCase();
	if (status === 'normal') {
		return 'status-normal';
	} else if (status === 'throttle' || status === 'throttled') {
		return 'status-throttled';
	} else {
		return 'status-other';
	}
}

export function createDataGroup(serviceName, items) {
	const group = document.createElement('div');
	group.className = 'data-group';
	group.innerHTML = `<h2>${serviceName}</h2>`;

	items.forEach((item) => {
		group.appendChild(createProgressBar(item));
	});

	return group;
}

// Internal function, not exported
function createProgressBar(data) {
	const usedAmount = parseFloat(data.used);
	const totalAmount = parseFloat(data.limit);
	const quotaUnit = data.volume_unit;
	const usedPercentage = (usedAmount / totalAmount) * 100;
	const remainingBalance = (totalAmount - usedAmount).toFixed(2);
	const remainingPercentage = Math.max(0, 100 - usedPercentage);

	const progressBar = document.createElement('div');
	progressBar.className = 'progress-bar';

	const isExceeded = usedAmount >= totalAmount;
	const statusText = isExceeded
		? 'Quota exceeded'
		: remainingPercentage === 0
		? 'Quota fully used'
		: `<strong>${remainingBalance} ${quotaUnit}</strong> (${remainingPercentage.toFixed(
				1
		  )}%) remaining till ${data.expiry_date}`;

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
        <span class="usage-amount">${usedAmount.toFixed(
					1
				)} ${quotaUnit}</span> / 
        <span class="total-amount">${totalAmount.toFixed(1)} ${quotaUnit}</span>
      </span>
      <span class="status-text ${
				isExceeded ? 'exceeded' : ''
			}">${statusText}</span>
    </div>
  `;

	return progressBar;
}
