// src/utils/fetchDataUtils.js

/**
 * Get the data limit for unlimited packages (legacy/fallback - 2025/07/28)
 * @param {string} packageName - The name of the package
 * @returns {number|null} - The data limit in GB or null if not an unlimited package
 */
export const getUnlimitedPackageLimit = (packageName) => {
	const packageLimits = {
		'UNLIMITED FAMILY': 1000,
		'UNLIMITED BOOST': 2000,
		'UNLIMITED BLAST': 4000,
		'UNLIMITED MAX': 5000,
	};

	// Convert package name to uppercase for case-insensitive comparison
	const upperPackageName = packageName?.toUpperCase();

	// Find matching package by checking if the package name contains any of the keys
	const matchingPackage = Object.keys(packageLimits).find((key) =>
		upperPackageName?.includes(key)
	);

	return matchingPackage ? packageLimits[matchingPackage] : null;
};

/**
 * Check if a package is truly unlimited (no caps)
 * @param {string} packageName - The name of the package
 * @param {string|null} limit - The limit value from API
 * @returns {boolean} - True if package is truly unlimited
 */
export const isTrulyUnlimitedPackage = (packageName, limit) => {
	const upperPackageName = packageName?.toUpperCase();
	const containsUnlimited = upperPackageName?.includes('UNLIMITED');
	const hasNullLimit = limit === null || limit === 'null';

	return containsUnlimited && hasNullLimit;
};

/**
 * Process usage data for unlimited packages
 * @param {Object} data - The raw usage data from the API
 * @returns {Object} - The processed usage data with correct limits
 */
// Function to process and normalize API response
export const processApiResponse = (data) => {
	return {
		reported_time: data.dataBundle.reported_time,
		speed_status: data.dataBundle.status,
		package_name: data.dataBundle.my_package_info.package_name,
		usage_data: data.dataBundle.my_package_info.usageDetails.map((item) => ({
			...item,
			service_name: 'Main Pack',
			fetched_from: '/UsageSummary',
		})),
	};
};

export const processUnlimitedPackageData = (data) => {
	// Check if this is a truly unlimited package first
	const mainPackItem = data.usage_data?.find(
		(item) => item.service_name === 'Main Pack'
	);

	if (
		mainPackItem &&
		isTrulyUnlimitedPackage(data.package_name, mainPackItem.limit)
	) {
		// For truly unlimited packages, keep the data as-is (limit: null, remaining: null)
		return {
			...data,
			is_truly_unlimited: true,
		};
	}

	// Fallback to legacy unlimited package processing (with hardcoded limits)
	const packageLimit = getUnlimitedPackageLimit(data.package_name);

	if (!packageLimit) {
		return data;
	}

	const processedUsageData = data.usage_data.map((item) => {
		if (item.service_name === 'Main Pack') {
			const used = parseFloat(item.used) || 0;
			return {
				...item,
				limit: packageLimit.toString(),
				remaining: Math.max(0, packageLimit - used).toString(),
				percentage: Math.min(100, (used / packageLimit) * 100),
			};
		}
		return item;
	});

	return {
		...data,
		usage_data: processedUsageData,
		is_truly_unlimited: false,
	};
};
