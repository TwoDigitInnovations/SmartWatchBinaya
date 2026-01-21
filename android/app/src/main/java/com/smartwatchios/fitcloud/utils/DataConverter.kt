package com.smartwatchios.fitcloud.utils

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import com.topstep.fitcloud.sdk.v2.model.config.FcDeviceInfo
import com.smartwatchios.fitcloud.models.*

object DataConverter {

    fun deviceInfoToMap(deviceInfo: FcDeviceInfo): WritableMap {
        return Arguments.createMap().apply {
            putString("name", deviceInfo.name ?: "Unknown")
            putString("address", deviceInfo.address ?: "")
            putString("firmwareVersion", deviceInfo.firmwareVersion ?: "")
            putString("hardwareVersion", deviceInfo.hardwareVersion ?: "")
            putString("model", deviceInfo.model ?: "")
            putInt("batteryLevel", deviceInfo.batteryLevel)
        }
    }

    fun syncResultToMap(syncResult: SyncResult): WritableMap {
        return Arguments.createMap().apply {
            putBoolean("success", syncResult.success)
            putInt("steps", syncResult.steps)
            putInt("heartRate", syncResult.heartRate)
            putInt("sleep", syncResult.sleep)
            putInt("bloodPressure", syncResult.bloodPressure)
            putDouble("timestamp", syncResult.timestamp.toDouble())
        }
    }

    fun stepDataToArray(stepDataList: List<StepData>): WritableArray {
        val array = Arguments.createArray()
        stepDataList.forEach { step ->
            val map = Arguments.createMap().apply {
                putInt("steps", step.steps)
                putInt("calories", step.calories)
                putDouble("distance", step.distance.toDouble())
                putDouble("timestamp", step.timestamp.toDouble())
            }
            array.pushMap(map)
        }
        return array
    }
}