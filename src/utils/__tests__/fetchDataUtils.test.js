// src/utils/__tests__/fetchDataUtils.test.js

import {
	getUnlimitedPackageLimit,
	processUnlimitedPackageData,
} from '../fetchDataUtils';

describe('Fetch Data Utilities', () => {
	describe('getUnlimitedPackageLimit', () => {
		it('should return correct limit for UNLIMITED FAMILY', () => {
			expect(getUnlimitedPackageLimit('UNLIMITED FAMILY')).toBe(1000);
		});

		it('should return correct limit for UNLIMITED BOOST', () => {
			expect(getUnlimitedPackageLimit('UNLIMITED BOOST')).toBe(2000);
		});

		it('should return correct limit for UNLIMITED BLAST', () => {
			expect(getUnlimitedPackageLimit('UNLIMITED BLAST')).toBe(4000);
		});

		it('should return correct limit for UNLIMITED MAX', () => {
			expect(getUnlimitedPackageLimit('UNLIMITED MAX')).toBe(5000);
		});

		it('should handle case-insensitive package names', () => {
			expect(getUnlimitedPackageLimit('Unlimited Boost')).toBe(2000);
			expect(getUnlimitedPackageLimit('unlimited family')).toBe(1000);
		});

		it('should handle packages with additional text', () => {
			expect(getUnlimitedPackageLimit('UNLIMITED BOOST - Special')).toBe(2000);
		});

		it('should return null for non-unlimited packages', () => {
			expect(getUnlimitedPackageLimit('Standard Package')).toBeNull();
			expect(getUnlimitedPackageLimit('')).toBeNull();
			expect(getUnlimitedPackageLimit(null)).toBeNull();
			expect(getUnlimitedPackageLimit(undefined)).toBeNull();
		});
	});

	describe('processUnlimitedPackageData', () => {
		it('should process unlimited package data correctly', () => {
			const testData = {
				package_name: 'UNLIMITED BOOST',
				reported_time: '2025-02-01',
				speed_status: 'NORMAL',
				usage_data: [
					{
						service_name: 'Main Pack',
						used: '500',
						limit: null,
						remaining: null,
						percentage: 0,
					},
				],
			};

			const processed = processUnlimitedPackageData(testData);

			expect(processed.usage_data[0]).toEqual({
				service_name: 'Main Pack',
				used: '500',
				limit: '2000',
				remaining: '1500',
				percentage: 25,
			});
		});

		it('should handle zero usage', () => {
			const testData = {
				package_name: 'UNLIMITED BOOST',
				usage_data: [
					{
						service_name: 'Main Pack',
						used: '0',
						limit: null,
						remaining: null,
						percentage: 0,
					},
				],
			};

			const processed = processUnlimitedPackageData(testData);

			expect(processed.usage_data[0]).toEqual({
				service_name: 'Main Pack',
				used: '0',
				limit: '2000',
				remaining: '2000',
				percentage: 0,
			});
		});

		it('should handle usage exceeding limit', () => {
			const testData = {
				package_name: 'UNLIMITED BOOST',
				usage_data: [
					{
						service_name: 'Main Pack',
						used: '2500',
						limit: null,
						remaining: null,
						percentage: 0,
					},
				],
			};

			const processed = processUnlimitedPackageData(testData);

			expect(processed.usage_data[0]).toEqual({
				service_name: 'Main Pack',
				used: '2500',
				limit: '2000',
				remaining: '0',
				percentage: 100,
			});
		});

		it('should not modify non-Main Pack data', () => {
			const testData = {
				package_name: 'UNLIMITED BOOST',
				usage_data: [
					{
						service_name: 'Bonus Data',
						used: '5',
						limit: '10',
						remaining: '5',
						percentage: 50,
					},
				],
			};

			const processed = processUnlimitedPackageData(testData);
			expect(processed.usage_data[0]).toEqual(testData.usage_data[0]);
		});

		it('should not modify data for non-unlimited packages', () => {
			const testData = {
				package_name: 'Standard Package',
				usage_data: [
					{
						service_name: 'Main Pack',
						used: '50',
						limit: '100',
						remaining: '50',
						percentage: 50,
					},
				],
			};

			const processed = processUnlimitedPackageData(testData);
			expect(processed).toEqual(testData);
		});
	});
});
