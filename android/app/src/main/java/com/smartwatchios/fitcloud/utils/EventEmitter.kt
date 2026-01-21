package com.smartwatchios.fitcloud.utils

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule

class EventEmitter(private val reactContext: ReactApplicationContext) {

    fun emit(eventName: String, params: Any?) {
        val eventData = when (params) {
            is Map<*, *> -> mapToWritableMap(params as Map<String, Any>)
            is WritableMap -> params
            else -> null
        }
        
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, eventData)
    }

    private fun mapToWritableMap(map: Map<String, Any>): WritableMap {
        val writableMap = Arguments.createMap()
        map.forEach { (key, value) ->
            when (value) {
                is String -> writableMap.putString(key, value)
                is Int -> writableMap.putInt(key, value)
                is Double -> writableMap.putDouble(key, value)
                is Boolean -> writableMap.putBoolean(key, value)
                is Map<*, *> -> writableMap.putMap(key, mapToWritableMap(value as Map<String, Any>))
                else -> writableMap.putString(key, value.toString())
            }
        }
        return writableMap
    }
}