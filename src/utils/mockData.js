// src/utils/mockData.js

export const mockData = {
	reported_time: '28-Sep-2024 04:54 PM',
	speed_status: 'NORMAL', // NORMAL || THROTTLED
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
			expiry_date: '27-Nov',
			fetched_from: '/ExtraGB',
			limit: 50,
			name: 'Extra GB - 50 GB',
			percentage: 94,
			remaining: 47.4,
			service_name: 'Extra GB',
			subscriptionid: null,
			timestamp: 0,
			unsubscribable: false,
			used: 2.6,
			volume_unit: 'GB',
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
