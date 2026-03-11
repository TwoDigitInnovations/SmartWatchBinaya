package com.smartwatchios.fitcloud

import android.util.Log
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.topstep.fitcloud.sdk.apis.ability.base.FcBatteryAbility
import com.topstep.fitcloud.sdk.apis.ability.data.FcSportAbility
import com.topstep.fitcloud.sdk.apis.ability.data.FcHealthAbility
import com.topstep.fitcloud.sdk.apis.ability.data.FcSyncAbility
import com.topstep.fitcloud.sdk.apis.ability.config.FcGoalAbility
import com.topstep.fitcloud.sdk.v2.model.data.FcHealthDataResult
import io.reactivex.rxjava3.android.schedulers.AndroidSchedulers
import io.reactivex.rxjava3.disposables.CompositeDisposable
import com.smartwatchios.MainApplication

class FitCloudStepsModule(
    private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

    private val disposables = CompositeDisposable()

    override fun getName(): String = "FitCloudStepsModule"

    // REQUIRED for NativeEventEmitter
    @ReactMethod fun addListener(eventName: String) {}
    @ReactMethod fun removeListeners(count: Int) {}

    private fun sendEvent(name: String, map: WritableMap?) {
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(name, map)
    }

    // =====================================================
    // 1️⃣ getStepData (FC_TodaySteps)
    // =====================================================

    @ReactMethod
    fun getStepData() {

        val sdk = MainApplication.fcSDKInstance ?: return
        val sportAbility = sdk.getAbility(FcSportAbility::class.java) ?: return

        disposables.add(
            sportAbility.requestTodayData()
                .observeOn(AndroidSchedulers.mainThread())
                .subscribe({ data ->

                    val map = Arguments.createMap()
                    map.putBoolean("succeed", true)
                    map.putString("userId", "")
                    map.putInt("steps", data.steps)
                    map.putDouble("distance", data.distance.toDouble())
                    map.putDouble("calories", data.calorie.toDouble())
                    map.putInt("deepSleepMinutes", data.deepSleepMinutes)
                    map.putInt("lightSleepMinutes", data.lightSleepMinutes)
                    map.putInt("avgBPM", data.avgBpm)

                    sendEvent("FC_TodaySteps", map)

                }, { error ->
                    val map = Arguments.createMap()
                    map.putBoolean("succeed", false)
                    map.putString("error", error.message)
                    sendEvent("FC_TodaySteps", map)
                })
        )
    }

    // =====================================================
    // 2️⃣ syncAllDataThenEmitToday
    // =====================================================

    @ReactMethod
    fun syncAllDataThenEmitToday() {

        val sdk = MainApplication.fcSDKInstance ?: return
        val syncAbility = sdk.getAbility(FcSyncAbility::class.java) ?: return

        disposables.add(
            syncAbility.syncAllData()
                .observeOn(AndroidSchedulers.mainThread())
                .subscribe({ progress ->

                    val map = Arguments.createMap()
                    map.putInt("progress", (progress * 100).toInt())
                    map.putString("tip", "")
                    sendEvent("FC_SyncProgress", map)

                }, { error ->
                    Log.e("FitCloud", "Sync error", error)
                }, {
                    sendEvent("FC_SyncFinished", null)
                    getStepData()
                })
        )
    }

    // =====================================================
    // 3️⃣ requestLatestHealthMeasurementData (Promise)
    // =====================================================

    @ReactMethod
    fun requestLatestHealthMeasurementData(promise: Promise) {

        val sdk = MainApplication.fcSDKInstance
            ?: return promise.reject("SDK_ERROR", "SDK not initialized")

        val ability = sdk.getAbility(FcHealthAbility::class.java)
            ?: return promise.reject("ABILITY_ERROR", "Health ability missing")

        ability.requestLatestHealthData()
            .observeOn(AndroidSchedulers.mainThread())
            .subscribe({ data: FcHealthDataResult ->

                val map = Arguments.createMap()
                map.putBoolean("succeed", true)
                map.putInt("bpm", data.heartRate)
                map.putInt("spO2", data.oxygen)
                map.putInt("diastolic", data.diastolicPressure)
                map.putInt("systolic", data.systolicPressure)
                map.putDouble("wrist", data.temperatureWrist.toDouble())
                map.putDouble("body", data.temperatureBody.toDouble())
                map.putInt("stressIndex", data.pressure)

                promise.resolve(map)

            }, { error ->
                promise.reject(
                    "FC_LATEST_HEALTH_MEASUREMENT_ERROR",
                    error.message,
                    error
                )
            })
    }

    // =====================================================
    // 4️⃣ getDashboardHealthData
    // =====================================================

    @ReactMethod
    fun getDashboardHealthData(promise: Promise) {

        val sdk = MainApplication.fcSDKInstance
            ?: return promise.reject("SDK_ERROR", "SDK not initialized")

        val goalAbility = sdk.getAbility(FcGoalAbility::class.java)
            ?: return promise.reject("GOAL_ERROR", "Goal ability missing")

        val sportAbility = sdk.getAbility(FcSportAbility::class.java)
            ?: return promise.reject("SPORT_ERROR", "Sport ability missing")

        val healthAbility = sdk.getAbility(FcHealthAbility::class.java)
            ?: return promise.reject("HEALTH_ERROR", "Health ability missing")

        goalAbility.requestDailyGoal()
            .flatMap { goal ->
                sportAbility.requestTodayData()
                    .map { today -> Pair(goal, today) }
            }
            .flatMap { pair ->
                healthAbility.requestLatestHealthData()
                    .map { Triple(pair.first, pair.second, it) }
            }
            .observeOn(AndroidSchedulers.mainThread())
            .subscribe({ triple ->

                val goal = triple.first
                val today = triple.second
                val latest = triple.third

                val goalsMap = Arguments.createMap()
                goalsMap.putInt("steps", goal.stepCountGoal)
                goalsMap.putDouble("distanceKm", goal.distanceGoal / 100000.0)
                goalsMap.putDouble("caloriesKcal", goal.calorieGoal / 1000.0)
                goalsMap.putInt("durationMinutes", goal.durationGoal)
                goalsMap.putDouble("timestamp", goal.timestamp.toDouble())

                val todayMap = Arguments.createMap()
                todayMap.putInt("steps", today.steps)
                todayMap.putDouble("distanceKm", today.distance / 1000.0)
                todayMap.putDouble("caloriesKcal", today.calorie / 1000.0)
                todayMap.putInt("deepSleepMinutes", today.deepSleepMinutes)
                todayMap.putInt("lightSleepMinutes", today.lightSleepMinutes)
                todayMap.putInt("avgBPM", today.avgBpm)

                val healthMap = Arguments.createMap()
                healthMap.putInt("bpm", latest.heartRate)
                healthMap.putInt("spO2", latest.oxygen)
                healthMap.putInt("diastolic", latest.diastolicPressure)
                healthMap.putInt("systolic", latest.systolicPressure)
                healthMap.putDouble("wrist", latest.temperatureWrist.toDouble())
                healthMap.putDouble("body", latest.temperatureBody.toDouble())
                healthMap.putInt("stressIndex", latest.pressure)

                val result = Arguments.createMap()
                result.putMap("goals", goalsMap)
                result.putMap("today", todayMap)
                result.putMap("healthVitals", healthMap)
                result.putString("userId", "")
                result.putBoolean("succeed", true)

                promise.resolve(result)

            }, { error ->
                promise.reject("FC_DASHBOARD_ERROR", error.message, error)
            })
    }

    // =====================================================
    // 5️⃣ queryBatteryInfo
    // =====================================================

    @ReactMethod
    fun queryBatteryInfo(promise: Promise) {

        val sdk = MainApplication.fcSDKInstance
            ?: return promise.reject("SDK_ERROR", "SDK not initialized")

        val ability = sdk.getAbility(FcBatteryAbility::class.java)
            ?: return promise.reject("ABILITY_ERROR", "Battery ability missing")

        ability.requestBatteryInfo()
            .observeOn(AndroidSchedulers.mainThread())
            .subscribe({ battery ->

                val batteryMap = Arguments.createMap()
                batteryMap.putInt("state", battery.state)
                batteryMap.putInt("value", battery.value)
                batteryMap.putInt("percent", battery.percent)

                val result = Arguments.createMap()
                result.putBoolean("succeed", true)
                result.putMap("batteryInfo", batteryMap)

                promise.resolve(result)

            }, { error ->
                promise.reject("FC_BATTERY_INFO_ERROR", error.message, error)
            })
    }
}
