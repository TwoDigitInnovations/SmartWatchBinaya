package com.smartwatchios.fitcloud

import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.topstep.fitcloud.sdk.v2.FcSDK
import com.topstep.fitcloud.sdk.v2.scanner.FcScannerCallback
import com.topstep.fitcloud.sdk.v2.scanner.FcScannerResult

class FitCloudSdkModule(
    private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "FitCloudSdk"

    private fun sendEvent(name: String, params: WritableMap?) {
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(name, params)
    }

    @ReactMethod
    fun startScan() {
        FcSDK.connector.scanner.start(object : FcScannerCallback {

            override fun onDeviceFound(result: FcScannerResult) {
                val device = result.device

                val map = Arguments.createMap().apply {
                    putString("name", device.name)
                    putString("mac", device.mac)
                    putInt("rssi", result.rssi)
                }

                sendEvent("onDeviceFound", map)
            }

            override fun onScanStopped() {
                sendEvent("onScanFinished", null)
            }
        })
    }

    @ReactMethod
    fun stopScan() {
        FcSDK.connector.scanner.stop()
    }
}
