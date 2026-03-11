package com.smartwatchios

import android.app.Application
import android.os.Handler
import android.os.Looper
import android.util.Log
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.topstep.fitcloud.sdk.v2.FcSDK
import com.topstep.wearkit.base.ProcessLifecycleManager
import com.smartwatchios.fitcloud.FitCloudSdkPackage
import io.reactivex.rxjava3.exceptions.UndeliverableException
import io.reactivex.rxjava3.plugins.RxJavaPlugins

class MainApplication : Application(), ReactApplication {

    companion object {
        lateinit var instance: MainApplication
            private set

        // ProcessLifecycleManager must be a singleton — created once here
        val processLifecycleManager = object : ProcessLifecycleManager() {}

        // ✅ FIX: removed `private set` so FitCloudProModule can read it directly.
        // It was already read via MainApplication.fcSDKInstance in the module,
        // which works fine since Kotlin companion objects are accessible from
        // other classes in the same package — but `private set` was blocking
        // writes from initializeFitCloudSDK() which is also in this file, so
        // it was actually fine. Keeping it internal for clarity.
        @Volatile
        var fcSDKInstance: FcSDK? = null
            internal set
    }

    override val reactHost: ReactHost by lazy {
        getDefaultReactHost(
            context = applicationContext,
            packageList = PackageList(this).packages.apply {
                add(FitCloudSdkPackage())
            },
        )
    }

    override fun onCreate() {
        super.onCreate()
        instance = this

        // ProcessLifecycleManager observes the app lifecycle via the SDK's own mechanism.
        // It does NOT implement ActivityLifecycleCallbacks — the SDK registers it internally.

        // ✅ Global RxJava error handler — prevents crashes from unhandled
        // errors in disposed observables (common with BLE streams).
        RxJavaPlugins.setErrorHandler { throwable ->
            val cause = if (throwable is UndeliverableException) throwable.cause else throwable
            when (cause) {
                is InterruptedException,
                is java.io.IOException,
                is SecurityException -> {
                    // Expected BLE/OS errors on disposed streams — ignore silently
                    Log.d("RxJava", "Ignored expected error: ${cause::class.simpleName}: ${cause.message}")
                }
                else -> {
                    Log.e("RxJava", "Undeliverable exception: ${cause?.message}", cause)
                }
            }
        }

        loadReactNative(this)

        // Small delay ensures ReactNative is fully initialized before SDK setup.
        // The SDK emits events via the RN bridge, so RN must be ready first.
        Handler(Looper.getMainLooper()).postDelayed({
            initializeFitCloudSDK()
        }, 200)
    }

    private fun initializeFitCloudSDK() {
        try {
            Log.d("FitCloudSDK", "Delayed initialization starting")

            fcSDKInstance = FcSDK.Builder(
                application = this,
                processLifecycleObserver = processLifecycleManager
            )
                .setTestStrictMode(BuildConfig.DEBUG)
                .build()

            Log.d("FitCloudSDK", "SDK initialized successfully: $fcSDKInstance")
        } catch (e: Exception) {
            Log.e("FitCloudSDK", "Failed to initialize SDK", e)
        }
    }

    override fun onTerminate() {
        super.onTerminate()
        fcSDKInstance?.release()
        fcSDKInstance = null
    }
}