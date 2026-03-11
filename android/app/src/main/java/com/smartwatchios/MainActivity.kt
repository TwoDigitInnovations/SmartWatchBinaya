package com.smartwatchios

import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.util.Log
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

    companion object {
        private const val TAG = "MainActivity"
        private const val PERMISSION_REQUEST_CODE = 1001
    }

    override fun getMainComponentName(): String = "smartwatchios"

    override fun createReactActivityDelegate(): ReactActivityDelegate =
        DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(null)
        requestBluetoothPermissions()
    }

    private fun requiredPermissions(): List<String> {
        val perms = mutableListOf<String>()

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            // Android 12+ — granular BLE permissions
            perms += Manifest.permission.BLUETOOTH_SCAN
            perms += Manifest.permission.BLUETOOTH_CONNECT
        } else {
            // Android < 12 — legacy BLE permissions
            perms += Manifest.permission.BLUETOOTH
            perms += Manifest.permission.BLUETOOTH_ADMIN
        }

        // Location is required for BLE scanning on all Android versions.
        // On Android 12+ with neverForLocation flag, some devices still require it.
        perms += Manifest.permission.ACCESS_FINE_LOCATION

        return perms
    }

    private fun requestBluetoothPermissions() {
        val missing = requiredPermissions().filter { perm ->
            ContextCompat.checkSelfPermission(this, perm) != PackageManager.PERMISSION_GRANTED
        }

        if (missing.isEmpty()) {
            Log.d(TAG, "✅ All BLE permissions already granted")
            onAllPermissionsGranted()
            return
        }

        Log.d(TAG, "Requesting permissions: $missing")
        ActivityCompat.requestPermissions(
            this,
            missing.toTypedArray(),
            PERMISSION_REQUEST_CODE
        )
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)

        if (requestCode != PERMISSION_REQUEST_CODE) return

        val results = permissions.zip(grantResults.toList())
        val denied = results.filter { it.second != PackageManager.PERMISSION_GRANTED }

        if (denied.isEmpty()) {
            Log.d(TAG, "✅ All BLE permissions granted")
            onAllPermissionsGranted()
        } else {
            Log.w(TAG, "❌ Denied permissions: ${denied.map { it.first }}")
            // App can still run — scanning will fail gracefully with an error event
        }
    }

    /**
     * Called when all required permissions are confirmed granted.
     * SDK is already initializing via MainApplication — this is a hook
     * for any post-permission work (e.g. re-init if SDK was null at startup).
     */
    private fun onAllPermissionsGranted() {
        Log.d(TAG, "onAllPermissionsGranted — SDK status: ${MainApplication.fcSDKInstance != null}")
        // SDK initializes 200ms after Application.onCreate via a Handler post.
        // By the time permissions are granted (user interaction), SDK is already up.
        // Nothing extra needed here — startScan() in JS will work normally.
    }
}