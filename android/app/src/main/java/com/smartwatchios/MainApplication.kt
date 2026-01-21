package com.smartwatchios

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.topstep.fitcloud.sdk.v2.FcSDK
import com.smartwatchios.fitcloud.FitCloudSdkPackage
import androidx.lifecycle.ProcessLifecycleOwner


class MainApplication : Application(), ReactApplication {

    override val reactHost: ReactHost by lazy {
        getDefaultReactHost(
            context = applicationContext,
            packageList = PackageList(this).packages.apply {
                // Manually added native package
                add(FitCloudSdkPackage())
            },
        )
    }

    override fun onCreate() {
        super.onCreate()

        FcSDK.Builder(
                    application = this,
                    processLifecycleObserver = ProcessLifecycleOwner.get()
                )
                    .setTestStrictMode(BuildConfig.DEBUG)
                    .build()

        loadReactNative(this)
    }


}
