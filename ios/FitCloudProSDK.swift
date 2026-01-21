import FitCloudKit
import FitCloudWFKit
import Foundation
//
//  FitCloudProSDK.swift
//  smartwatchios
//
//  Created by Chetan on 04/12/25.
//
import React
import TopStepAISDK

class FitCloudProSDK: NSObject {

    var isWatchDeviceRegisterAIServiceSuccess: Bool = false
    var watchDeviceRegisterAIServiceError: NSError? = nil
    private var hasCreatedASRTaskBeforeDeviceReady: Bool = false
    private var isReceivingASROpusData: Bool = false
    private var asrTaskId: String? = nil
    private var aigcTaskId: String? = nil

    private var toConfirmedAIPhoto: UIImage? = nil

    private var aiPhotoPreviewWidth: Int = 0
    private var aiPhotoPreviewHeight: Int = 0

    private var appendVoiceDataBlock: ((_ voiceData: Data) -> Void)? = nil

    var aiWatchfaceSlotIndex: Int = 0
    var aiWatchfaceInstallPostion: Int = 0
    var aiWatchfaceDateTimeColorStyle: Int = 0

    static let shared: FitCloudProSDK = FitCloudProSDK()

    private override init() {

    }

    func start() {
        initFitCloudProSDKs()
    }

    /// Initializes the FitCloudPro SDKs with required configurations
    private func initFitCloudProSDKs() {
        let option = FitCloudOption()
        option.debugMode = false
        option.shouldAutoReconnectWhenAppLaunch = true
        option.includeTimestampInLogs = false
        FitCloudKit.initWith(option, callback: self)
        addNotificationObservers()
    }

    private func addNotificationObservers() {
        // Listen for the notification that the device preparation sync work is completed
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(onDeviceReady(_:)),
            name: NSNotification.Name(rawValue: FITCLOUDEVENT_PREPARESYNCWORK_END_NOTIFY),
            object: nil)
    }

    @objc private func onDeviceReady(_ notification: NSNotification) {
        print("Device is ready for AI services")

        // If there was a pending ASR task creation request, create it now

    }

}

extension FitCloudProSDK: FitCloudCallback {

    /// Called when the watch device requests to find the iPhone device
    /// This function will be triggered when user activates the find phone feature on the watch
    func onFindiPhoneEvent() {
        print("The watch device requests to find the iPhone device...")
    }

    func onConnectStatusChanged(_ state: FITCLOUDBLECENTRALSTATE) {
        RCTEventEmitter.shared?.sendEvent(
            withName: "onConnectStatus",
            body: ["state": state.rawValue]
        )
    }
  
  

    /// Called when the watch device sends a photo control command
    /// This function will be triggered when user wants to take a photo using the watch

}
