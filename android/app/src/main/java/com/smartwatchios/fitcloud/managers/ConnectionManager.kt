package com.smartwatchios.fitcloud.managers

import android.bluetooth.BluetoothDevice
import com.topstep.fitcloud.sdk.v2.FcSDK
import com.topstep.fitcloud.sdk.v2.FcConnector
import com.topstep.fitcloud.sdk.v2.model.config.FcDeviceInfo
import com.smartwatchios.fitcloud.utils.EventEmitter
import kotlinx.coroutines.*

class ConnectionManager(
    private val fcSDK: FcSDK,
    private val eventEmitter: EventEmitter
) {
    private var connector: FcConnector? = null
    private var isScanning = false
    private var scanJob: Job? = null

    suspend fun startScan(
        timeout: Long,
        onDeviceFound: (BluetoothDevice) -> Unit,
        onScanComplete: () -> Unit,
        onError: (String) -> Unit
    ) = withContext(Dispatchers.Main) {
        if (isScanning) {
            onError("Scan already in progress")
            return@withContext
        }

        try {
            isScanning = true
            connector = fcSDK.connector
            
            connector?.startScan(object : FcConnector.ScanCallback {
                override fun onDeviceFound(device: BluetoothDevice) {
                    onDeviceFound(device)
                }

                override fun onScanFinished() {
                    isScanning = false
                    onScanComplete()
                }

                override fun onScanFailed(errorCode: Int) {
                    isScanning = false
                    onError("Scan failed with code: $errorCode")
                }
            })

            scanJob = CoroutineScope(Dispatchers.Main).launch {
                delay(timeout)
                if (isScanning) {
                    stopScan()
                    onScanComplete()
                }
            }
        } catch (e: Exception) {
            isScanning = false
            onError("Scan error: ${e.message}")
        }
    }

    fun stopScan() {
        scanJob?.cancel()
        connector?.stopScan()
        isScanning = false
    }

    suspend fun connect(
        macAddress: String,
        onConnected: (FcDeviceInfo) -> Unit,
        onDisconnected: () -> Unit,
        onError: (Int, String) -> Unit
    ) = withContext(Dispatchers.Main) {
        try {
            connector = fcSDK.connector
            
            connector?.connect(macAddress, object : FcConnector.ConnectCallback {
                override fun onConnected(deviceInfo: FcDeviceInfo) {
                    onConnected(deviceInfo)
                }

                override fun onDisconnected() {
                    onDisconnected()
                }

                override fun onConnectFailed(errorCode: Int, errorMsg: String) {
                    onError(errorCode, errorMsg)
                }
            })
        } catch (e: Exception) {
            onError(-1, "Connection error: ${e.message}")
        }
    }

    fun disconnect() {
        connector?.disconnect()
    }

    fun isConnected(): Boolean {
        return connector?.isConnected() ?: false
    }

    fun getConnectionState(): String {
        return when {
            connector?.isConnected() == true -> "CONNECTED"
            connector?.isConnecting() == true -> "CONNECTING"
            else -> "DISCONNECTED"
        }
    }
}
