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
