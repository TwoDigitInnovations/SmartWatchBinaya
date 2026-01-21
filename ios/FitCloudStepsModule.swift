import Foundation
import FitCloudKit
import React

@objc(FitCloudStepsModule)
class FitCloudStepsModule: RCTEventEmitter {

    private var hasListeners = false

    override init() {
        super.init()
    }

    override static func requiresMainQueueSetup() -> Bool { true }

    override func startObserving() { hasListeners = true }
    override func stopObserving() { hasListeners = false }

    override func supportedEvents() -> [String]! {
        return [
            "FC_TodaySteps",
            "FC_SyncProgress",
            "FC_SyncFinished",
            "FC_LatestHealthMeasurementData"
        ]
    }

    private func getDateString(daysAgo: Int) -> String {
        let calendar = Calendar(identifier: .gregorian)
        let date = calendar.date(byAdding: .day, value: -daysAgo, to: Date()) ?? Date()
        let formatter = DateFormatter()
        formatter.calendar = calendar
        formatter.locale = Locale(identifier: "en_US_POSIX")
        formatter.timeZone = TimeZone(secondsFromGMT: 0)
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter.string(from: date)
    }

    // MARK: Step/Activity APIs
    @objc func getStepData() {
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
                self.sendEvent(withName: "FC_TodaySteps", body: payload)
            } else {
                self.sendEvent(withName: "FC_TodaySteps", body: [
                    "succeed": succeed,
                    "userId": userId ?? "",
                    "error": error?.localizedDescription ?? "Failed to fetch today's activity data"
                ])
            }
        }
    }

    @objc func syncAllDataThenEmitToday() {
        FitCloudKit.manualSyncData(with: .ALL, progress: { progress, tip in
            self.sendEvent(withName: "FC_SyncProgress", body: [
                "progress": Int(progress * 100),
                "tip": tip ?? ""
            ])
        }, block: { succeed, userId, records, error in
            FitCloudKit.requestHealthAndSportsDataToday { succeed2, userId2, dataObject, error2 in
                if let data = dataObject {
                    self.sendEvent(withName: "FC_TodaySteps", body: [
                        "succeed": succeed2,
                        "userId": userId2 ?? "",
                        "steps": data.steps,
                        "distance": data.distance,
                        "calories": data.calorie,
                        "deepSleepMinutes": data.deepSleepInMinutes,
                        "lightSleepMinutes": data.lightSleepInMinutes,
                        "avgBPM": data.avgBPM
                    ])
                } else {
                    self.sendEvent(withName: "FC_TodaySteps", body: [
                        "error": error2?.localizedDescription ?? "Failed to fetch today's activity data after sync",
                        "succeed": succeed2,
                        "userId": userId2 ?? ""
                    ])
                }
            }
        }, finished: {
            self.sendEvent(withName: "FC_SyncFinished", body: [:])
        })
    }

  @objc(requestLatestHealthMeasurementData:rejecter:)
  func requestLatestHealthMeasurementData(
      _ resolver: @escaping RCTPromiseResolveBlock,
      rejecter: @escaping RCTPromiseRejectBlock
  ) {
      FitCloudKit.requestLatestHealthMeasurementData { succeed, dataObject, error in
          if succeed, let data = dataObject {
              // Map fields similarly to the event emitter variant above
              let payload: [String: Any] = [
                  "succeed": succeed,
                  "bpm": Int(data.bpm),
                  "SpO2": Int(data.spO2),
                  "diastolic": Int(data.diastolic),
                  "systolic": Int(data.systolic),
                  "wrist": data.wrist,
                  "body": data.body,
                  "stressIndex": Int(data.stressIndex)
              ]
              resolver(payload)
          } else {
              let nsError = error as NSError?
              rejecter(
                  "FC_LATEST_HEALTH_MEASUREMENT_ERROR",
                  nsError?.localizedDescription ?? "Failed to fetch latest health measurement data",
                  error
              )
          }
      }
  }
  
  @objc(getDashboardHealthData:rejecter:)
  func getDashboardHealthData(
      _ resolver: @escaping RCTPromiseResolveBlock,
      rejecter: @escaping RCTPromiseRejectBlock
  ) {

      FitCloudKit.getDailyGoal { succeedGoal, goalObject, goalError in

          if let goalError = goalError {
              rejecter("FC_DAILY_GOAL_ERROR", goalError.localizedDescription, goalError)
              return
          }

          FitCloudKit.requestHealthAndSportsDataToday {
              succeedToday, userId, todayData, todayError in

              if let todayError = todayError {
                  rejecter("FC_TODAY_DATA_ERROR", todayError.localizedDescription, todayError)
                  return
              }

              FitCloudKit.requestLatestHealthMeasurementData {
                  succeedLatest, latestData, latestError in

                  if let latestError = latestError {
                      rejecter(
                          "FC_LATEST_HEALTH_MEASUREMENT_ERROR",
                          latestError.localizedDescription,
                          latestError
                      )
                      return
                  }

                  // -------- GOALS --------
                  var goals: [String: Any] = [:]
                  goals["steps"] = goalObject?.stepCountGoal ?? 0
                  goals["distanceKm"] = Double(goalObject?.distanceGoal ?? 0) / 100_000.0
                  goals["caloriesKcal"] = Double(goalObject?.calorieGoal ?? 0) / 1000.0
                  goals["durationMinutes"] = goalObject?.durationGoal ?? 0
                  goals["timestamp"] = goalObject?.timestamp?.timeIntervalSince1970 ?? 0

                  // -------- TODAY --------
                  var today: [String: Any] = [:]
                  today["steps"] = todayData?.steps ?? 0
                  today["distanceKm"] = Double(todayData?.distance ?? 0) / 1000.0
                  today["caloriesKcal"] = Double(todayData?.calorie ?? 0) / 1000.0
                  today["deepSleepMinutes"] = todayData?.deepSleepInMinutes ?? 0
                  today["lightSleepMinutes"] = todayData?.lightSleepInMinutes ?? 0
                  today["avgBPM"] = todayData?.avgBPM ?? 0

                  // -------- LATEST HEALTH --------
                  var healthVitals: [String: Any] = [:]
                healthVitals["bpm"] = Int(latestData?.bpm ?? 0)
                healthVitals["spO2"] = Int(latestData?.spO2 ?? 0)
                healthVitals["diastolic"] = Int(latestData?.diastolic ?? 0)
                healthVitals["systolic"] = Int(latestData?.systolic ?? 0)
                healthVitals["wrist"] = latestData?.wrist ?? 0
                healthVitals["body"] = latestData?.body ?? 0
                healthVitals["stressIndex"] = Int(latestData?.stressIndex ?? 0)

                  // -------- FINAL PAYLOAD --------
                  var payload: [String: Any] = [:]
                  payload["goals"] = goals
                  payload["today"] = today
                  payload["healthVitals"] = healthVitals
                  payload["userId"] = userId ?? ""
                  payload["succeed"] = succeedGoal && succeedToday && succeedLatest

                  resolver(payload)
              }
          }
      }
  }
  
  @objc(queryAppUsageCountStatistics:rejecter:)
  func queryAppUsageCountStatistics(
      _ resolver: @escaping RCTPromiseResolveBlock,
      rejecter: @escaping RCTPromiseRejectBlock
  ) {

      FitCloudKit.queryAppUsageCountStatistics { succeed, statistics, error in

          if let error = error {
              rejecter(
                  "FC_APP_USAGE_STATS_ERROR",
                  error.localizedDescription,
                  error
              )
              return
          }

          guard let stats = statistics else {
              rejecter(
                  "FC_APP_USAGE_STATS_EMPTY",
                  "No app usage statistics available",
                  nil
              )
              return
          }

          var dailyResults: [[String: Any]] = []

          for daily in stats.dailyStatisticsList {

              var dailyDict: [String: Any] = [:]
              dailyDict["timestamp"] = daily.date.timeIntervalSince1970

              var appList: [[String: Any]] = []

              for appUsage in daily.appUsageCountList {

                  var appDict: [String: Any] = [:]

                  // ⚠️ Property names depend on SDK – common ones below
                  appDict["appId"] =
                      appUsage.value(forKey: "appId") as? Int ?? 0

                  appDict["usageCount"] =
                      appUsage.value(forKey: "usageCount") as? UInt32 ?? 0

                  appList.append(appDict)
              }

              dailyDict["apps"] = appList
              dailyResults.append(dailyDict)
          }

          resolver([
              "succeed": succeed,
              "dailyStatistics": dailyResults
          ])
      }
  }

  @objc(queryBatteryInfo:rejecter:)
  func queryBatteryInfo(
      _ resolver: @escaping RCTPromiseResolveBlock,
      rejecter: @escaping RCTPromiseRejectBlock
  ) {

      guard let batteryInfo = FitCloudKit.batteryInfo() else {
          rejecter(
              "FC_BATTERY_INFO_EMPTY",
              "Battery info not available",
              nil
          )
          return
      }

      var batteryDict: [String: Any] = [:]

      batteryDict["state"] = batteryInfo.state          // BATTERYSTATE
      batteryDict["value"] = batteryInfo.value          // bars / grids
      batteryDict["percent"] = batteryInfo.percent      // 0–100

      resolver([
          "succeed": true,
          "batteryInfo": batteryDict
      ])
  }
  
}

