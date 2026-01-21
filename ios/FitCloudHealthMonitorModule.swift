import Foundation
import FitCloudKit
import React

@objc(FitCloudHealthMonitorModule)
class FitCloudHealthMonitorModule: RCTEventEmitter {

    private var hasListeners = false

    override init() {
        super.init()
    }

    override static func requiresMainQueueSetup() -> Bool { true }

    override func startObserving() { hasListeners = true }
    override func stopObserving() { hasListeners = false }

    override func supportedEvents() -> [String]! {
        return [
            // health monitor specific events
            "FC_HM_TodaySports",
            "FC_HM_SyncProgress",
            "FC_HM_SyncFinished"
        ]
    }

    // MARK: - API
    // Fetch current health timing monitor settings
    // Resolves with: { succeed: boolean, on: boolean, begin: number, end: number }
    @objc(getHealthTimingMonitorSetting:rejecter:)
    func getHealthTimingMonitorSetting(
        _ resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        FitCloudKit.getHealthTimingMonitorSetting { succeed, htmSetting, error in
            if succeed, let s = htmSetting {
                resolve([
                    "succeed": true,
                    "on": s.on,
                    "begin": s.begin,
                    "end": s.end
                ])
            } else {
                let nsError = error as NSError?
                let code = "\(nsError?.code ?? -1)"
                let message = error?.localizedDescription ?? "Failed to get health timing monitor settings"
                reject(code, message, error)
            }
        }
    }

    // Set health timing monitor settings
    // Expects: { on: boolean, begin: number, end: number }
    // Resolves with: { succeed: boolean }
    @objc(setHealthTimingMonitor:resolver:rejecter:)
    func setHealthTimingMonitor(
        _ settings: NSDictionary,
        resolver resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        let obj = FitCloudHTMObject()
        if let on = settings["on"] as? Bool { obj.on = on }
        if let begin = settings["begin"] as? NSNumber { obj.begin = begin.uint16Value }
        if let end = settings["end"] as? NSNumber { obj.end = end.uint16Value }

        FitCloudKit.setHealthTimingMonitor(obj) { succeed, error in
            if succeed {
                resolve(["succeed": true])
            } else {
                let nsError = error as NSError?
                let code = "\(nsError?.code ?? -1)"
                let message = error?.localizedDescription ?? "Failed to set health timing monitor"
                reject(code, message, error)
            }
        }
    }

    // MARK: - Sports Data (from demo list)
    // Emits: FC_HM_TodaySports with payload similar to demo logging
    @objc func fetchSportsDataToday() {
        FitCloudKit.requestHealthAndSportsDataToday { succeed, userId, dataObject, error in
            if let data = dataObject {
                let payload: [String: Any] = [
                    "succeed": succeed,
                    "userId": userId ?? "",
                    "steps": data.steps,
                    "distance": data.distance,
                    "calories": data.calorie,
                    "deepSleepMinutes": data.deepSleepInMinutes,
                    "lightSleepMinutes": data.lightSleepInMinutes,
                    "avgBPM": data.avgBPM
                ]
                self.sendEvent(withName: "FC_HM_TodaySports", body: payload)
            } else {
                self.sendEvent(withName: "FC_HM_TodaySports", body: [
                    "succeed": succeed,
                    "userId": userId ?? "",
                    "error": error?.localizedDescription ?? "Failed to fetch today's activity data"
                ])
            }
        }
    }

    // Runs a manual sync and emits progress and a finished event, plus a completion payload
    // Emits:
    //  - FC_HM_SyncProgress: { progress: Int, tip: String }
    //  - FC_HM_TodaySports on post-sync fetch
    //  - FC_HM_SyncFinished when task ends
    @objc func manualSyncData() {
        FitCloudKit.manualSyncData(with: .ALL, progress: { progress, tip in
            self.sendEvent(withName: "FC_HM_SyncProgress", body: [
                "progress": Int(progress * 100),
                "tip": tip ?? ""
            ])
        }, block: { succeed, userId, records, error in
            // After sync attempt, mirror demo: just emit a simple payload; also fetch today's data
            FitCloudKit.requestHealthAndSportsDataToday { succeed2, userId2, dataObject, error2 in
                if let data = dataObject {
                    self.sendEvent(withName: "FC_HM_TodaySports", body: [
                        "succeed": succeed2,
                        "userId": userId2 ?? "",
                        "steps": data.steps,
                        "distance": data.distance,
                        "calories": data.calorie,
                        "deepSleepMinutes": data.deepSleepInMinutes,
                        "lightSleepMinutes": data.lightSleepInMinutes,
                        "avgBPM": data.avgBPM,
                        "recordsCount": records?.count ?? 0
                    ])
                } else {
                    self.sendEvent(withName: "FC_HM_TodaySports", body: [
                        "succeed": succeed2,
                        "userId": userId2 ?? "",
                        "error": error2?.localizedDescription ?? "Failed to fetch today's activity data after sync",
                        "recordsCount": records?.count ?? 0
                    ])
                }
            }
        }, finished: {
            self.sendEvent(withName: "FC_HM_SyncFinished", body: [:])
        })
    }
  
  
}
