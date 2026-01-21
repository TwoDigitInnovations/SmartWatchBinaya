import Foundation
import FitCloudKit
import React

@objc(FitCloudGoalsModule)
class FitCloudGoalsModule: RCTEventEmitter {

    private var hasListeners = false

    override init() {
        super.init()
    }

    override static func requiresMainQueueSetup() -> Bool { true }

    override func startObserving() { hasListeners = true }
    override func stopObserving() { hasListeners = false }

    override func supportedEvents() -> [String]! {
        return [
            "FC_Targets",
            "FC_TodayOverview"
        ]
    }

    private func extractInt(from object: Any, key: String) -> Int? {
        let mirror = Mirror(reflecting: object)
        for child in mirror.children {
            if let label = child.label, label == key {
                if let intVal = child.value as? Int { return intVal }
                if let uintVal = child.value as? UInt { return Int(uintVal) }
                if let int32Val = child.value as? Int32 { return Int(int32Val) }
                if let int16Val = child.value as? Int16 { return Int(int16Val) }
                if let int8Val = child.value as? Int8 { return Int(int8Val) }
                if let uint32Val = child.value as? UInt32 { return Int(uint32Val) }
                if let uint16Val = child.value as? UInt16 { return Int(uint16Val) }
                if let uint8Val = child.value as? UInt8 { return Int(uint8Val) }
            }
        }
        return nil
    }

    // MARK: Goal APIs
    @objc func goalData(_ callback: @escaping RCTResponseSenderBlock) {
        Task { @MainActor in
            do {
                let goal = try await FitCloudKit.dailyGoal()
                var payload: [String: Any] = ["succeed": true]
                if let stepCountGoal = extractInt(from: goal, key: "stepCountGoal") { payload["stepCountGoal"] = stepCountGoal }
                if let distanceRaw = extractInt(from: goal, key: "distance") { payload["distance"] = distanceRaw }
                if let calorieRaw = extractInt(from: goal, key: "calorie") { payload["calorie"] = calorieRaw }
                if let duration = extractInt(from: goal, key: "duration") { payload["duration"] = duration }
                if let distanceRaw = payload["distance"] as? Int {
                    payload["distanceKm"] = Double(distanceRaw) / 100000.0
                }
                if let calorieRaw = payload["calorie"] as? Int {
                    payload["calorieKCal"] = Double(calorieRaw) / 1000.0
                }
                callback([payload])
            } catch {
                callback([[
                    "succeed": false,
                    "error": error.localizedDescription
                ]])
            }
        }
    }
  
  @objc(getDailyGoal:rejecter:)
  func getDailyGoal(
      _ resolver: @escaping RCTPromiseResolveBlock,
      rejecter: @escaping RCTPromiseRejectBlock
  ) {

      FitCloudKit.getDailyGoal { succeed, goalObject, error in

          if let error = error {
              rejecter(
                  "FC_DAILY_GOAL_ERROR",
                  error.localizedDescription,
                  error
              )
              return
          }

          guard let goal = goalObject else {
              rejecter(
                  "FC_DAILY_GOAL_EMPTY",
                  "Daily goal data not available",
                  nil
              )
              return
          }

          let payload: [String: Any] = [
              "succeed": succeed,
              "stepCountGoal": goal.stepCountGoal,
              "distanceGoal": goal.distanceGoal,   // cm
              "calorieGoal": goal.calorieGoal,     // cal
              "durationGoal": goal.durationGoal,   // minutes
              "timestamp": goal.timestamp?.timeIntervalSince1970 ?? 0
          ]

          resolver(payload)
      }
  }


    @objc func fetchTodayOverview() {
        Task { @MainActor in
            var goalPayload: [String: Any] = [:]
            do {
                let goal = try await FitCloudKit.dailyGoal()
                goalPayload["succeed"] = true
                if let stepGoal = extractInt(from: goal, key: "stepGoal") { goalPayload["stepGoal"] = stepGoal }
                if let distanceGoal = extractInt(from: goal, key: "distanceGoal") { goalPayload["distanceGoal"] = distanceGoal }
                if let calorieGoal = extractInt(from: goal, key: "calorieGoal") { goalPayload["calorieGoal"] = calorieGoal }
                if let sleepGoalMinutes = extractInt(from: goal, key: "sleepGoalInMinutes") { goalPayload["sleepGoalMinutes"] = sleepGoalMinutes }
            } catch {
                goalPayload = [
                    "succeed": false,
                    "error": error.localizedDescription
                ]
            }

            FitCloudKit.requestHealthAndSportsDataToday { succeed, userId, dataObject, err in
                var activityPayload: [String: Any] = [:]
                if let data = dataObject {
                    activityPayload = [
                        "succeed": succeed,
                        "userId": userId ?? "",
                        "steps": data.steps,
                        "distance": data.distance,
                        "calories": data.calorie,
                        "deepSleepMinutes": data.deepSleepInMinutes,
                        "lightSleepMinutes": data.lightSleepInMinutes,
                        "avgBPM": data.avgBPM
                    ]
                } else {
                    activityPayload = [
                        "succeed": succeed,
                        "userId": userId ?? "",
                        "error": err?.localizedDescription ?? "Failed to fetch today's activity data"
                    ]
                }

                let combined: [String: Any] = [
                    "goals": goalPayload,
                    "activity": activityPayload
                ]

                self.sendEvent(withName: "FC_TodayOverview", body: combined)
            }
        }
    }

    @objc(setDailyGoal:resolver:rejecter:)
    func setDailyGoal(
        _ goalDict: NSDictionary,
        resolver resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        let steps = (goalDict["steps"] as? NSNumber)?.uint32Value ?? 0
        let distanceKm = (goalDict["distanceKm"] as? NSNumber)?.doubleValue ?? 0.0
        let calorieKCal = (goalDict["calorieKCal"] as? NSNumber)?.doubleValue ?? 0.0
        let durationMinutes = (goalDict["durationMinutes"] as? NSNumber)?.uint16Value ?? 0

        var timestamp: Date? = nil
        if let tsMs = (goalDict["timestampMs"] as? NSNumber)?.doubleValue {
            timestamp = Date(timeIntervalSince1970: tsMs / 1000.0)
        }

        let distanceRaw = UInt32(distanceKm * 100000.0)
        let calorieRaw = UInt32(calorieKCal * 1000.0)

        FitCloudKit.setDailyGoalWithStepCount(
            steps,
            distance: distanceRaw,
            calorie: calorieRaw,
            duration: durationMinutes,
            timestamp: timestamp
        ) { succeed, error in
            if succeed {
                resolve([
                    "succeed": true,
                    "steps": steps,
                    "distanceRaw": distanceRaw,
                    "calorieRaw": calorieRaw,
                    "durationMinutes": durationMinutes,
                    "timestampMs": timestamp != nil ? Int((timestamp!.timeIntervalSince1970) * 1000.0) : 0
                ])
            } else {
                let nsError = error as NSError?
                let code = "\(nsError?.code ?? -1)"
                let message = error?.localizedDescription ?? "Failed to set daily goal"
                reject(code, message, error)
            }
        }
    }
}
