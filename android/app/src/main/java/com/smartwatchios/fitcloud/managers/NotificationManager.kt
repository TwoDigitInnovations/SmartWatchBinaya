package com.smartwatchios.fitcloud.managers

import com.topstep.fitcloud.sdk.v2.FcSDK
import com.topstep.fitcloud.sdk.v2.model.settings.FcNotification
import com.smartwatchios.fitcloud.utils.EventEmitter
import kotlinx.coroutines.*

class NotificationManager(
    private val fcSDK: FcSDK,
    private val eventEmitter: EventEmitter
) {

    suspend fun sendNotification(
        title: String,
        message: String,
        type: String,
        onSuccess: () -> Unit,
        onError: (String) -> Unit
    ) = withContext(Dispatchers.IO) {
        try {
            val notification = FcNotification().apply {
                this.title = title
                this.content = message
                this.type = mapNotificationType(type)
            }

            fcSDK.fcNotification.send(notification)
            
            withContext(Dispatchers.Main) {
                onSuccess()
                eventEmitter.emit("notification_sent", mapOf(
                    "title" to title,
                    "type" to type
                ))
            }
        } catch (e: Exception) {
            withContext(Dispatchers.Main) {
                onError(e.message ?: "Failed to send notification")
                eventEmitter.emit("notification_error", mapOf(
                    "error" to e.message
                ))
            }
        }
    }

    private fun mapNotificationType(type: String): Int {
        return when (type.lowercase()) {
            "call" -> FcNotification.TYPE_CALL
            "sms" -> FcNotification.TYPE_SMS
            "whatsapp" -> FcNotification.TYPE_WHATSAPP
            "facebook" -> FcNotification.TYPE_FACEBOOK
            "twitter" -> FcNotification.TYPE_TWITTER
            "instagram" -> FcNotification.TYPE_INSTAGRAM
            "linkedin" -> FcNotification.TYPE_LINKEDIN
            "messenger" -> FcNotification.TYPE_MESSENGER
            "line" -> FcNotification.TYPE_LINE
            "telegram" -> FcNotification.TYPE_TELEGRAM
            "wechat" -> FcNotification.TYPE_WECHAT
            "qq" -> FcNotification.TYPE_QQ
            else -> FcNotification.TYPE_OTHER
        }
    }

    fun clearNotifications() {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                fcSDK.fcNotification.clear()
                eventEmitter.emit("notifications_cleared", emptyMap())
            } catch (e: Exception) {
                eventEmitter.emit("notification_error", mapOf(
                    "error" to "Failed to clear notifications: ${e.message}"
                ))
            }
        }
    }
}