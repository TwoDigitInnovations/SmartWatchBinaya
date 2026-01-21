package com.smartwatchios.fitcloud

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class FitCloudSdkPackage : ReactPackage {

    override fun createNativeModules(
        reactContext: ReactApplicationContext
    ) = listOf(FitCloudSdkModule(reactContext))

    override fun createViewManagers(
        reactContext: ReactApplicationContext
    ) = emptyList<ViewManager<*, *>>()
}

