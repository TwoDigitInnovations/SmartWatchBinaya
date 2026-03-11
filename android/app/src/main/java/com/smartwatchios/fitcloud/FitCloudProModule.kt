package com.smartwatchios.fitcloud

import android.util.Log
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.smartwatchios.MainApplication
import com.topstep.wearkit.base.connector.ConnectorState
import com.topstep.wearkit.base.scanner.ScanResult
import io.reactivex.rxjava3.android.schedulers.AndroidSchedulers
import io.reactivex.rxjava3.core.Observable
import io.reactivex.rxjava3.disposables.CompositeDisposable
import io.reactivex.rxjava3.disposables.Disposable
import java.util.concurrent.TimeUnit

class FitCloudProModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private val TAG = "FitCloudProModule"

    // Connector state subscription
    private val disposables = CompositeDisposable()

    // Scan subscription — kept separate so stopScan() doesn't kill connector state listener
    private var scanDisposable: Disposable? = null

    override fun getName(): String = "FitCloudProModule"

    // ─────────────────────────────────────────────
    // Internal helpers
    // ─────────────────────────────────────────────

    private fun sendEvent(eventName: String, params: WritableMap?) {
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }

    // ─────────────────────────────────────────────
    // watchIsConnected
    // JS: FitCloudProModule.watchIsConnected(callback)
    // ─────────────────────────────────────────────

    @ReactMethod
    fun watchIsConnected(callback: Callback) {
        try {
            val sdk = MainApplication.fcSDKInstance
            if (sdk != null) {
                val isConnected = sdk.connector.getConnectorState() == ConnectorState.CONNECTED
                val map = Arguments.createMap()
                map.putBoolean("success", true)
                sendEvent("FC_watchstatus", map)
                callback.invoke(isConnected)

            } else {
                val map = Arguments.createMap()
                map.putBoolean("success", false)
                sendEvent("FC_watchstatus", map)
                callback.invoke(false)
            }
        } catch (e: Exception) {
            Log.e(TAG, "watchIsConnected error", e)
            callback.invoke(false)
        }
    }

    // ─────────────────────────────────────────────
    // startScan
    // sdk.scanner.scan(time, unit, checkLocationServiceFirst, acceptEmptyDeviceName)
    // confirmed from FcScanner.java
    // Emits "FC_Discovered" + "FC_DiscoveredUpdated" → { name, mac, rssi }
    // Emits "onScanFailed" → { errorCode, message }
    // JS: FitCloudProModule.startScan()
    // ─────────────────────────────────────────────

    @ReactMethod
    fun startScan() {
        Log.e(TAG, "▶ startScan() called — thread")
        val map = Arguments.createMap()
                map.putBoolean("startscan", true)
                sendEvent("FC_watchstatus", map)
        // Step 1: Check SDK
        val sdk = MainApplication.fcSDKInstance
        Log.e(TAG, "▶ fcSDKInstance = $sdk")
        if (sdk == null) {
            Log.e(TAG, "✗ SDK is null — not initialized yet")
            val map: WritableMap = Arguments.createMap()
            map.putInt("errorCode", -2)
            map.putString("message", "SDK not initialized")
            sendEvent("onScanFailed", map)
            return
        }

        // Step 2: Check Bluetooth state (BluetoothAdapter.isEnabled is a standard Android property — no import needed with FQN)
        val btEnabled = android.bluetooth.BluetoothAdapter.getDefaultAdapter()?.isEnabled == true
        Log.e(TAG, "▶ Bluetooth enabled = $btEnabled")
        if (!btEnabled) {
            Log.e(TAG, "✗ Bluetooth is off or unavailable")
            val map: WritableMap = Arguments.createMap()
            map.putInt("errorCode", -3)
            map.putString("message", "Bluetooth is off")
            sendEvent("onScanFailed", map)
            return
        }

        try {
            // Step 3: Dispose previous scan
            Log.e(TAG, "▶ Disposing previous scan: isDisposed=${scanDisposable?.isDisposed}")
            scanDisposable?.dispose()
            scanDisposable = null

            // Step 4: Create observable
            Log.e(TAG, "▶ Calling sdk.scanner.scan(30s)...")
            val scanObservable: Observable<ScanResult> = sdk.scanner.scan(
                30L,
                TimeUnit.SECONDS,
                true,  // checkLocationServiceFirst
                true    // acceptEmptyDeviceName
            )
            Log.e(TAG, "▶ Observable created: $scanObservable")

            // Step 5: Subscribe
            val sub: Disposable = scanObservable
                .observeOn(AndroidSchedulers.mainThread())
                .subscribe(
                    { result: ScanResult ->
                        // Log field/method names on first result so we can replace reflection
                        val clazz: Class<*> = result.javaClass
                        Log.e(TAG, "▶ ScanResult class: ${clazz.name}")
                        Log.e(TAG, "▶ ScanResult fields: ${clazz.declaredFields.map { it.name }}")
                        Log.e(TAG, "▶ ScanResult getters: ${clazz.methods
                            .filter { it.name.startsWith("get") }
                            .map { it.name }}")

                        val name = readField(result, clazz,
                            "name", "deviceName", "device_name")
                        val mac  = readField(result, clazz,
                            "address", "mac", "macAddress", "bleAddress")
                        val rssi = readField(result, clazz,
                            "rssi", "RSSI").toIntOrNull() ?: 0

                        Log.e(TAG, "▶ Device: name=$name  mac=$mac  rssi=$rssi")

                        val map: WritableMap = Arguments.createMap()
                        map.putString("name", name)
                        map.putString("uuid", mac)
                        map.putInt("rssi", rssi)
                        sendEvent("FC_Discovered", map)
                        sendEvent("FC_DiscoveredUpdated", map)
                    },
                    { error: Throwable ->
                        Log.e(TAG, "✗ scan onError: ${error::class.java.simpleName}: ${error.message}", error)
                        val map: WritableMap = Arguments.createMap()
                        map.putInt("errorCode", -1)
                        map.putString("message", error.message ?: "Scan failed")
                        sendEvent("onScanFailed", map)
                    }
                )

            scanDisposable = sub
            Log.e(TAG, "▶ Subscribed. isDisposed=${sub.isDisposed}")

        } catch (e: Exception) {
            Log.e(TAG, "✗ startScan exception: ${e::class.java.simpleName}: ${e.message}", e)
            val map: WritableMap = Arguments.createMap()
            map.putInt("errorCode", -1)
            map.putString("message", e.message ?: "Scan failed")
            sendEvent("onScanFailed", map)
        }
    }

    // ─────────────────────────────────────────────
    // stopScan
    // Disposes scan observable — FcScanner has no explicit stop method.
    // JS: FitCloudProModule.stopScan()
    // ─────────────────────────────────────────────

    @ReactMethod
    fun stopScan() {
        Log.e(TAG, "▶ stopScan() called")
        scanDisposable?.dispose()
        scanDisposable = null
    }

    // ─────────────────────────────────────────────
    // connect
    // connect(address, userId, bindOrLogin, sex, age, height, weight)
    // Emits "onConnectorStateChange" → { state, mac }
    // JS: FitCloudProModule.connect(mac, userId, code)
    // ─────────────────────────────────────────────

@ReactMethod
    fun connect(mac: String, userId: String, code: String) {
        try {
            val sdk = MainApplication.fcSDKInstance ?: run {
                Log.e(TAG, "connect: SDK not initialized")
                return
            }

            // Stop scanning
            scanDisposable?.dispose()
            scanDisposable = null

            // Clear previous connector observers
            disposables.clear()

            // 🔥 Check if already bound (local persistence)
            val prefs = reactApplicationContext
                .getSharedPreferences("fitcloud_prefs", android.content.Context.MODE_PRIVATE)

            val savedMac = prefs.getString("bound_mac", null)
            val savedUser = prefs.getString("bound_user", null)

            val isAlreadyBound = (savedMac == mac && savedUser == userId)

            Log.e(TAG, "connect: isAlreadyBound = $isAlreadyBound")

            // Observe state
            val stateObservable: Observable<ConnectorState> =
                sdk.connector.observerConnectorState()

            disposables.add(
                stateObservable
                    .observeOn(AndroidSchedulers.mainThread())
                    .subscribe(
                        { state ->

                            val stateMap = Arguments.createMap()
                            stateMap.putString("state", state.name)
                            stateMap.putString("mac", mac)
                            sendEvent("onConnectorStateChange", stateMap)

                            when (state) {
                                ConnectorState.CONNECTED -> {

                                    // 🔥 Save bound state only first time
                                    if (!isAlreadyBound) {
                                        prefs.edit()
                                            .putString("bound_mac", mac)
                                            .putString("bound_user", userId)
                                            .apply()
                                    }

                                    val bindMap = Arguments.createMap()
                                    bindMap.putBoolean("success", true)
                                    bindMap.putString("mac", mac)
                                    sendEvent("FC_BindResult", bindMap)
                                }

                                ConnectorState.DISCONNECTED -> {
                                    val bindMap = Arguments.createMap()
                                    bindMap.putBoolean("success", false)
                                    bindMap.putString("mac", mac)
                                    sendEvent("FC_BindResult", bindMap)
                                }

                                else -> {}
                            }
                        },
                        { error ->
                            Log.e(TAG, "observerConnectorState error: ${error.message}")

                            val bindMap = Arguments.createMap()
                            bindMap.putBoolean("success", false)
                            bindMap.putString("error", error.message ?: "Unknown error")
                            sendEvent("FC_BindResult", bindMap)
                        }
                    )
            )

            // 🔥 THIS IS THE IMPORTANT FIX
            sdk.connector.connect(
                mac,
                userId,
                true,               // autoReconnect
                !isAlreadyBound,    // 👈 bind only if not already bound
                25,
                170f,
                65f
            )

        } catch (e: Exception) {
            Log.e(TAG, "connect error", e)
        }
    }



    // ─────────────────────────────────────────────
    // disconnect
    // JS: FitCloudProModule.disconnect()
    // ─────────────────────────────────────────────

    @ReactMethod
    fun disconnect() {
        try {
            disposables.clear()
            MainApplication.fcSDKInstance?.connector?.disconnect()
        } catch (e: Exception) {
            Log.e(TAG, "disconnect error", e)
        }
    }

    // ─────────────────────────────────────────────
    // unbindUser
    // JS: const result = await FitCloudProModule.unbindUser(type)
    // ─────────────────────────────────────────────

    @ReactMethod
    fun unbindUser(type: Int, promise: Promise) {
        try {
            val sdk = MainApplication.fcSDKInstance ?: run {
                promise.reject("SDK_NULL", "SDK not initialized")
                return
            }
            disposables.clear()
            sdk.connector.disconnect()
            promise.resolve(true)
        } catch (e: Exception) {
            Log.e(TAG, "unbindUser error", e)
            promise.reject("UNBIND_ERROR", e.message ?: "Unknown error")
        }
    }

    // ─────────────────────────────────────────────
    // boundUserData
    // JS: FitCloudProModule.boundUserData(callback)
    // ─────────────────────────────────────────────

    @ReactMethod
    fun boundUserData(callback: Callback) {
        try {
            val sdk = MainApplication.fcSDKInstance ?: run {
                callback.invoke(false)
                return
            }
            val connector = sdk.connector
            val isConnected = connector.getConnectorState() == ConnectorState.CONNECTED
            val device = connector.getDevice()

            val map: WritableMap = Arguments.createMap()
            map.putBoolean("isConnected", isConnected)
            map.putBoolean("isBound", connector.isBindOrLogin())
            map.putString("mac", device?.address ?: "")
            map.putString("deviceName", device?.name ?: "")
            callback.invoke(map)

        } catch (e: Exception) {
            Log.e(TAG, "boundUserData error", e)
            callback.invoke(false)
        }
    }

    // ─────────────────────────────────────────────
    // isUserAlreadyBound
    // JS: FitCloudProModule.isUserAlreadyBound(userId, callback)
    // ─────────────────────────────────────────────
    
  @ReactMethod
    fun isUserAlreadyBound(userId: String, callback: Callback) {
        val prefs = reactApplicationContext
            .getSharedPreferences("fitcloud_prefs", android.content.Context.MODE_PRIVATE)

        val savedUser = prefs.getString("bound_user", null)

        callback.invoke(savedUser == userId)
    }



    // ─────────────────────────────────────────────
    // getFirmware
    // JS: FitCloudProModule.getFirmware(callback)
    // ─────────────────────────────────────────────

    @ReactMethod
    fun getFirmware(callback: Callback) {
        try {
            val sdk = MainApplication.fcSDKInstance ?: run {
                callback.invoke(false)
                return
            }

            if (sdk.connector.getConnectorState() != ConnectorState.CONNECTED) {
                Log.w(TAG, "getFirmware: not connected")
                callback.invoke(false)
                return
            }

            val deviceInfo: Any? = sdk.connector.configFeature().getDeviceInfo()
            if (deviceInfo == null) {
                callback.invoke(false)
                return
            }

            val clazz: Class<*> = deviceInfo.javaClass
            Log.e(TAG, "FcDeviceInfo fields:  ${clazz.declaredFields.map { it.name }}")
            Log.e(TAG, "FcDeviceInfo methods: ${clazz.methods
                .filter { it.name.startsWith("get") }
                .map { it.name }}")

            val map: WritableMap = Arguments.createMap()
            map.putString("firmwareVersion", readField(deviceInfo, clazz,
                "firmwareVersion", "firmware_version", "firmware", "fwVersion", "version"))
            map.putString("hardwareVersion", readField(deviceInfo, clazz,
                "hardwareVersion", "hardware_version", "hardware", "hwVersion"))
            map.putString("model", readField(deviceInfo, clazz,
                "deviceName", "model", "name", "productName", "device_name"))
            callback.invoke(map)

        } catch (e: Exception) {
            Log.e(TAG, "getFirmware error", e)
            callback.invoke(false)
        }
    }

    // ─────────────────────────────────────────────
    // Reflection helper — tries field names then getter methods
    // Replace with direct field access once logcat reveals real names
    // ─────────────────────────────────────────────

    private fun readField(obj: Any, clazz: Class<*>, vararg candidates: String): String {
        for (name in candidates) {
            try {
                val field = clazz.getDeclaredField(name)
                field.isAccessible = true
                val value = field.get(obj)
                if (value != null) return value.toString()
            } catch (_: NoSuchFieldException) { }
        }
        for (name in candidates) {
            val getter = "get${name.replaceFirstChar { it.uppercaseChar() }}"
            try {
                val method = clazz.getMethod(getter)
                val value = method.invoke(obj)
                if (value != null) return value.toString()
            } catch (_: Exception) { }
        }
        return ""
    }

    // ─────────────────────────────────────────────
    // NativeEventEmitter required stubs
    // ─────────────────────────────────────────────

    @ReactMethod
    fun addListener(eventName: String) {
    }

    @ReactMethod
    fun removeListeners(count: Int) {
    }

    // ─────────────────────────────────────────────
    // Cleanup
    // ─────────────────────────────────────────────

    override fun invalidate() {
        super.invalidate()
        scanDisposable?.dispose()
        scanDisposable = null
        disposables.clear()
    }
}