function formatSubscriberId(id) {
	if (id.startsWith('0')) {
		return '94' + id.substring(1);
	} else if (id.startsWith('94')) {
		return id;
	} else {
		console.warn('Unexpected subscriberId format:', id);
		return id;
	}
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.action === 'getSubscriberIdFromLocalStorage') {
		const selectedAcc = localStorage.getItem('selectedAcc');
		if (selectedAcc) {
			const formattedId = formatSubscriberId(selectedAcc);
			sendResponse({ subscriberId: formattedId });
		} else {
			sendResponse({ error: 'selectedAcc not found in localStorage' });
		}
	}
	return true; // Keeps the message channel open for asynchronous response
});

console.log('Content script loaded', new Date().toLocaleTimeString());
