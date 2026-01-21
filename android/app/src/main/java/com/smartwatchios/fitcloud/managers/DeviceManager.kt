package com.smartwatchios.fitcloud.managers

import com.topstep.fitcloud.sdk.v2.FcSDK
import com.topstep.fitcloud.sdk.v2.model.config.FcDeviceInfo
import com.smartwatchios.fitcloud.models.BatteryInfo
import com.smartwatchios.fitcloud.utils.EventEmitter
import kotlinx.coroutines.*

class DeviceManager(
    private val fcSDK: FcSDK,
    private val eventEmitter: EventEmitter
) {

    suspend fun getDeviceInfo(
        onSuccess: (FcDeviceInfo) -> Unit,
        onError: (String) -> Unit
    ) = withContext(Dispatchers.IO) {
        try {
            val deviceInfo = fcSDK.requestDeviceInfo()
            withContext(Dispatchers.Main) {
                onSuccess(deviceInfo)
            }
        } catch (e: Exception) {
            withContext(Dispatchers.Main) {
                onError("Failed to get device info: ${e.message}")
            }
        }
    }

    suspend fun getBatteryInfo(
        onSuccess: (BatteryInfo) -> Unit,
        onError: (String) -> Unit
    ) = withContext(Dispatchers.IO) {
        try {
            val battery = fcSDK.requestBatteryInfo()
            val batteryInfo = BatteryInfo(
                level = battery.level,
                isCharging = battery.isCharging,
                status = if (battery.isCharging) "Charging" else "Discharging"
            )
            withContext(Dispatchers.Main) {
                onSuccess(batteryInfo)
            }
        } catch (e: Exception) {
            withContext(Dispatchers.Main) {
                onError("Failed to get battery info: ${e.message}")
            }
        }
    }

    suspend fun startHeartRateMonitoring(
        onHeartRateUpdate: (Int) -> Unit,
        onError: (String) -> Unit
    ) = withContext(Dispatchers.Main) {
        try {
            fcSDK.startHeartRateMonitoring(object : FcSDK.HeartRateCallback {
                override fun onHeartRateReceived(heartRate: Int) {
                    onHeartRateUpdate(heartRate)
                }

                override fun onError(errorCode: Int) {
                    onError("Heart rate monitoring error: $errorCode")
                }
            })
        } catch (e: Exception) {
            onError("Failed to start heart rate monitoring: ${e.message}")
        }
    }

    fun stopHeartRateMonitoring() {
        fcSDK.stopHeartRateMonitoring()
    }

    suspend fun findDevice(
        onSuccess: () -> Unit,
        onError: (String) -> Unit
    ) = withContext(Dispatchers.IO) {
        try {
            fcSDK.findDevice()
            withContext(Dispatchers.Main) {
                onSuccess()
            }
        } catch (e: Exception) {
            withContext(Dispatchers.Main) {
                onError("Failed to find device: ${e.message}")
            }
        }
    }
}
