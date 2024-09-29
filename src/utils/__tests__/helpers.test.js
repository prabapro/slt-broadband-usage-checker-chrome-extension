// File: src/utils/__tests__/helpers.test.js

import {
	formatSubscriberId,
	formatAccountId,
	checkExtraGB,
	formatSpeedStatus,
	getStatusClass,
	createDataGroup,
	navigateToExtraGBGroup,
	createProgressBar,
	getFillClass,
} from '../helpers';
import { mockData } from '../mockData';

describe('Helper Functions', () => {
	describe('formatSubscriberId', () => {
		it('should format a subscriber ID starting with 0', () => {
			expect(formatSubscriberId('0123456789')).toBe('94123456789');
		});

		it('should not change a subscriber ID already starting with 94', () => {
			expect(formatSubscriberId('94123456789')).toBe('94123456789');
		});

		it('should warn and return the original ID for unexpected formats', () => {
			const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
			expect(formatSubscriberId('123456789')).toBe('123456789');
			expect(consoleSpy).toHaveBeenCalledWith(
				'Unexpected subscriberId format:',
				'123456789'
			);
			consoleSpy.mockRestore();
		});
	});

	describe('formatAccountId', () => {
		it('should format an account ID starting with 94', () => {
			expect(formatAccountId('94123456789')).toBe('0123456789');
		});

		it('should not change an account ID already starting with 0', () => {
			expect(formatAccountId('0123456789')).toBe('0123456789');
		});
	});

	describe('checkExtraGB', () => {
		it('should return true if there is remaining Extra GB data', () => {
			const testData = {
				usage_data: mockData.usage_data.filter(
					(item) => item.service_name === 'Extra GB'
				),
			};
			expect(checkExtraGB(testData)).toBe(true);
		});

		it('should return false if there is no remaining Extra GB data', () => {
			const testData = {
				usage_data: [
					{
						...mockData.usage_data.find(
							(item) => item.service_name === 'Extra GB'
						),
						remaining: '0',
					},
				],
			};
			expect(checkExtraGB(testData)).toBe(false);
		});

		it('should return false if there is no Extra GB data', () => {
			const testData = {
				usage_data: mockData.usage_data.filter(
					(item) => item.service_name !== 'Extra GB'
				),
			};
			expect(checkExtraGB(testData)).toBe(false);
		});

		it('should handle invalid input gracefully', () => {
			expect(checkExtraGB(null)).toBe(false);
			expect(checkExtraGB({})).toBe(false);
			expect(checkExtraGB({ usage_data: null })).toBe(false);
		});
	});

	describe('formatSpeedStatus', () => {
		it('should format normal status without Extra GB', () => {
			expect(formatSpeedStatus('NORMAL')).toEqual({
				text: 'Speed is Normal',
				hasClickable: false,
			});
		});

		it('should format normal status with Extra GB', () => {
			expect(formatSpeedStatus('NORMAL', true)).toEqual({
				text: 'Speed is Normal with ',
				clickable: 'Extra GB',
				hasClickable: true,
			});
		});

		it('should format throttled status', () => {
			expect(formatSpeedStatus('THROTTLED')).toEqual({
				text: 'Speed is Throttled',
				hasClickable: false,
			});
		});

		it('should capitalize the first letter for other statuses', () => {
			expect(formatSpeedStatus('UNKNOWN')).toEqual({
				text: 'Unknown',
				hasClickable: false,
			});
		});
	});

	describe('getStatusClass', () => {
		it('should return correct class for normal status without Extra GB', () => {
			expect(getStatusClass('NORMAL')).toBe('status-normal');
		});

		it('should return correct class for normal status with Extra GB', () => {
			expect(getStatusClass('NORMAL', true)).toBe('status-normal-extra');
		});

		it('should return correct class for throttled status', () => {
			expect(getStatusClass('THROTTLED')).toBe('status-throttled');
		});

		it('should return correct class for other statuses', () => {
			expect(getStatusClass('UNKNOWN')).toBe('status-other');
		});
	});

	describe('createDataGroup', () => {
		it('should create a data group element', () => {
			document.body.innerHTML = '<div id="usage-data"></div>';
			const serviceName = 'Main Pack';
			const items = mockData.usage_data.filter(
				(item) => item.service_name === serviceName
			);
			const group = createDataGroup(serviceName, items);
			expect(group).toBeInstanceOf(HTMLElement);
			expect(group.className).toBe('data-group');
			expect(group.querySelector('h2').textContent).toBe(serviceName);
			expect(group.querySelectorAll('.progress-bar').length).toBe(items.length);
		});
	});

	describe('navigateToExtraGBGroup', () => {
		it('should call goToPage with correct index when Extra GB group exists', () => {
			const serviceNames = [
				...new Set(mockData.usage_data.map((item) => item.service_name)),
			];
			document.body.innerHTML = serviceNames
				.map(
					(serviceName) =>
						`<div class="data-group" data-group-name="${serviceName}"></div>`
				)
				.join('');

			const goToPageMock = jest.fn();
			navigateToExtraGBGroup(goToPageMock);

			const expectedIndex = serviceNames.indexOf('Extra GB');
			expect(goToPageMock).toHaveBeenCalledWith(expectedIndex);
			expect(expectedIndex).not.toBe(-1); // Ensure 'Extra GB' exists in the mock data
		});

		it('should not call goToPage when Extra GB group does not exist', () => {
			const serviceNames = [
				...new Set(
					mockData.usage_data
						.filter((item) => item.service_name !== 'Extra GB')
						.map((item) => item.service_name)
				),
			];
			document.body.innerHTML = serviceNames
				.map(
					(serviceName) =>
						`<div class="data-group" data-group-name="${serviceName}"></div>`
				)
				.join('');

			const goToPageMock = jest.fn();
			navigateToExtraGBGroup(goToPageMock);
			expect(goToPageMock).not.toHaveBeenCalled();
		});
	});

	describe('createProgressBar', () => {
		it('should create a progress bar element', () => {
			const testData = mockData.usage_data[0]; // Use the first item from mock data
			const progressBar = createProgressBar(testData);

			expect(progressBar).toBeInstanceOf(HTMLElement);
			expect(progressBar.className).toBe('progress-bar');
			expect(progressBar.querySelector('h3').textContent).toBe(testData.name);
			expect(progressBar.querySelector('.bar')).not.toBeNull();
			expect(progressBar.querySelector('.fill')).not.toBeNull();
			expect(progressBar.querySelectorAll('.progress-info span').length).toBe(
				2
			);
			expect(progressBar.querySelector('.usage-info')).not.toBeNull();
			expect(progressBar.querySelector('.status')).not.toBeNull();
		});

		it('should handle exceeded quota', () => {
			const testData = {
				...mockData.usage_data[0],
				used: '110',
				limit: '100',
				volume_unit: 'GB',
				expiry_date: '30-Sep',
			};
			const progressBar = createProgressBar(testData);

			expect(progressBar.querySelector('.fill').classList).toContain(
				'fill-exceeded'
			);
			expect(progressBar.querySelector('.status').classList).toContain(
				'exceeded'
			);
			expect(progressBar.querySelector('.status').textContent.trim()).toBe(
				'Quota exceeded'
			);
		});
	});

	describe('createProgressBar edge cases', () => {
		it('should handle zero usage', () => {
			const testData = {
				...mockData.usage_data[0],
				used: '0',
				limit: '100',
				volume_unit: 'GB',
				expiry_date: '30-Sep',
			};
			const progressBar = createProgressBar(testData);
			expect(progressBar.querySelector('.fill').style.width).toBe('0%');
			expect(progressBar.querySelector('.status').textContent.trim()).toContain(
				'100.00 GB (100.0%) remaining'
			);
		});

		it('should handle usage equal to limit', () => {
			const testData = {
				...mockData.usage_data[0],
				used: '100',
				limit: '100',
				volume_unit: 'GB',
				expiry_date: '30-Sep',
			};
			const progressBar = createProgressBar(testData);
			expect(progressBar.querySelector('.fill').style.width).toBe('100%');
			expect(progressBar.querySelector('.status').textContent.trim()).toBe(
				'Quota fully used'
			);
		});
	});

	describe('checkExtraGB edge cases', () => {
		it('should handle empty usage_data array', () => {
			const testData = { usage_data: [] };
			expect(checkExtraGB(testData)).toBe(false);
		});

		it('should handle Extra GB with zero remaining', () => {
			const testData = {
				usage_data: [{ service_name: 'Extra GB', remaining: '0' }],
			};
			expect(checkExtraGB(testData)).toBe(false);
		});
	});

	describe('getFillClass', () => {
		it('should return fill-low for percentage less than 25', () => {
			expect(getFillClass(24)).toBe('fill-low');
		});

		it('should return fill-medium for percentage between 25 and 50', () => {
			expect(getFillClass(40)).toBe('fill-medium');
		});

		it('should return fill-high for percentage between 50 and 75', () => {
			expect(getFillClass(74)).toBe('fill-high');
		});

		it('should return fill-very-high for percentage 75 or greater, but less than 100', () => {
			expect(getFillClass(75)).toBe('fill-very-high');
			expect(getFillClass(99)).toBe('fill-very-high');
		});

		it('should return fill-exceeded for percentage 100 or greater', () => {
			expect(getFillClass(100)).toBe('fill-exceeded');
			expect(getFillClass(110)).toBe('fill-exceeded');
		});
	});
});
