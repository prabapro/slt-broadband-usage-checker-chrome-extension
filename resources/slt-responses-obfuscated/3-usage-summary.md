# Usage Summary

## 1. Main Pack Details

#### Request

```
https://omniscapp.slt.lk/mobitelint/slt/api/BBVAS/UsageSummary?subscriberID=94112******
```

#### Response

##### When within the quota (Speed: Normal)

```
{
	"isSuccess": true,
	"errorMessege": null,
	"exceptionDetail": null,
	"dataBundle": {
		"status": "NORMAL",
		"reported_time": "28-Sep-2024 09:26 AM",
		"my_package_summary": {
			"limit": "600.0",
			"used": "597.9",
			"volume_unit": "GB"
		},
		"bonus_data_summary": {
			"limit": "6.0",
			"used": "6.0",
			"volume_unit": "GB"
		},
		"free_data_summary": null,
		"vas_data_summary": {
			"limit": "100.0",
			"used": "0.1",
			"volume_unit": "GB"
		},
		"extra_gb_data_summary": null,
		"my_package_info": {
			"package_name": "ANY DELIGHT",
			"package_summary": null,
			"usageDetails": [
				{
					"name": "Any Time Usage.",
					"limit": "600.0",
					"remaining": "2.1",
					"used": "597.9",
					"percentage": 0,
					"volume_unit": "GB",
					"expiry_date": "30-Sep",
					"claim": null,
					"unsubscribable": false,
					"timestamp": 0,
					"subscriptionid": null
				}
			],
			"reported_time": "28-Sep-2024 09:26 AM"
		}
	},
	"errorShow": null,
	"errorCode": null
}
```

##### When quota is exceeded (Speed: Throttled)

```
{
	"isSuccess": true,
	"errorMessege": null,
	"exceptionDetail": null,
	"dataBundle": {
		"status": "THROTTLED",
		"reported_time": "28-Sep-2024 01:51 PM",
		"my_package_summary": {
			"limit": "600.0",
			"used": "600.0",
			"volume_unit": "GB"
		},
		"bonus_data_summary": {
			"limit": "6.0",
			"used": "6.0",
			"volume_unit": "GB"
		},
		"free_data_summary": null,
		"vas_data_summary": {
			"limit": "100.0",
			"used": "0.3",
			"volume_unit": "GB"
		},
		"extra_gb_data_summary": null,
		"my_package_info": {
			"package_name": "ANY DELIGHT",
			"package_summary": null,
			"usageDetails": [
				{
					"name": "Any Time Usage.",
					"limit": "600.0",
					"remaining": "0.0",
					"used": "600.0",
					"percentage": 0,
					"volume_unit": "GB",
					"expiry_date": "30-Sep",
					"claim": null,
					"unsubscribable": false,
					"timestamp": 0,
					"subscriptionid": null
				}
			],
			"reported_time": "28-Sep-2024 01:51 PM"
		}
	},
	"errorShow": null,
	"errorCode": null
}

```

## 2. Extra GB

#### Request

```
https://omniscapp.slt.lk/mobitelint/slt/api/BBVAS/ExtraGB?subscriberID=94112******
```

#### Response

##### When no Extra GB obtained

```
{
	"isSuccess": true,
	"errorMessege": null,
	"exceptionDetail": null,
	"dataBundle": {
		"package_name": null,
		"package_summary": null,
		"usageDetails": [],
		"reported_time": "2024-09-28T09:52:00"
	},
	"errorShow": null,
	"errorCode": null
}
```

##### When Extra GB is obtained

```
{
	"isSuccess": true,
	"errorMessege": null,
	"exceptionDetail": null,
	"dataBundle": {
		"package_name": null,
		"package_summary": { "limit": 50.0, "used": 0.0, "volume_unit": "GB" },
		"usageDetails": [
			{
				"name": "Extra GB - 50 GB",
				"limit": 50.0,
				"remaining": 50.0,
				"used": 0.0,
				"percentage": 100.0,
				"volume_unit": "GB",
				"expiry_date": "27-Nov",
				"claim": null,
				"unsubscribable": false,
				"timestamp": 0.0,
				"subscriptionid": null
			}
		],
		"reported_time": "2024-09-28T13:56:00"
	},
	"errorShow": null,
	"errorCode": null
}

```

## 3. Bonus Data

#### Request

```
https://omniscapp.slt.lk/mobitelint/slt/api/BBVAS/BonusData?subscriberID=94112******
```

#### Response

```
{
	"isSuccess": true,
	"errorMessege": null,
	"exceptionDetail": null,
	"dataBundle": {
		"package_name": null,
		"package_summary": { "limit": 6.0, "used": 6.0, "volume_unit": "GB" },
		"usageDetails": [
			{
				"name": "Loyalty",
				"limit": 6.0,
				"remaining": 0.0,
				"used": 6.0,
				"percentage": 0.0,
				"volume_unit": "GB",
				"expiry_date": "01-Oct",
				"claim": null,
				"unsubscribable": false,
				"timestamp": 0.0,
				"subscriptionid": null
			}
		],
		"reported_time": "2024-09-28T09:52:00"
	},
	"errorShow": null,
	"errorCode": null
}

```

## 4. Add-Ons Data

#### Request

```
https://omniscapp.slt.lk/mobitelint/slt/api/BBVAS/GetDashboardVASBundles?subscriberID=94112******
```

#### Response

```
{
	"isSuccess": true,
	"errorMessege": null,
	"exceptionDetail": null,
	"dataBundle": {
		"package_name": null,
		"package_summary": { "limit": "100.0", "used": "0.1", "volume_unit": "GB" },
		"usageDetails": [
			{
				"name": "Meet Max Auto Renewal",
				"limit": "100.0",
				"remaining": "99.9",
				"used": "0.1",
				"percentage": 99,
				"volume_unit": "GB",
				"expiry_date": "27-Oct",
				"claim": null,
				"unsubscribable": true,
				"timestamp": 1727456438000,
				"subscriptionid": "P_VB_Q_OM_Re30D_100GB"
			}
		],
		"reported_time": "28-Sep-2024 09:48 AM"
	},
	"errorShow": null,
	"errorCode": null
}
```

## 5. Free Data

#### Request

```
https://omniscapp.slt.lk/mobitelint/slt/api/BBVAS/FreeData?subscriberID=94112******
```

#### Response

```
{
	"isSuccess": true,
	"errorMessege": null,
	"exceptionDetail": null,
	"dataBundle": {
		"package_name": null,
		"package_summary": null,
		"usageDetails": [],
		"reported_time": "2024-09-28T09:51:00"
	},
	"errorShow": null,
	"errorCode": null
}

```
