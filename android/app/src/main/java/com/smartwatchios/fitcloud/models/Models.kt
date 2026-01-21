package com.smartwatchios.fitcloud.models

data class StepData(
    val steps: Int,
    val calories: Int,
    val distance: Float,
    val timestamp: Long
)

data class HeartRateData(
    val heartRate: Int,
    val timestamp: Long
)

data class SleepData(
    val startTime: Long,
    val endTime: Long,
    val deepSleep: Int,
    val lightSleep: Int,
    val awake: Int,
    val timestamp: Long
)

data class BloodPressureData(
    val systolic: Int,
    val diastolic: Int,
    val timestamp: Long
)

data class BatteryInfo(
    val level: Int,
    val isCharging: Boolean,
    val status: String
)

data class SyncResult(
    var success: Boolean = false,
    var steps: Int = 0,
    var heartRate: Int = 0,
    var sleep: Int = 0,
    var bloodPressure: Int = 0,
    var timestamp: Long = 0
)