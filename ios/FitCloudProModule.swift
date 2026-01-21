import Foundation
import CoreBluetooth
import FitCloudKit
import React

@objc(FitCloudProModule)
class FitCloudProModule: RCTEventEmitter {

    private var hasListeners = false
  private var scannedPeripherals: [String: FitCloudPeripheral] = [:]

    override init() {
        super.init()
        registerObservers()
    }

    override static func requiresMainQueueSetup() -> Bool { true }

    override func startObserving() { hasListeners = true }
    override func stopObserving() { hasListeners = false }
  
  @objc
  override func constantsToExport() -> [AnyHashable: Any]! {
    return [
      "LANGUAGE": [
        "NOTSET": 0x00,
        "CHINESE_SIMPLIFIED": 0x01,
        "CHINESE_TRADITIONAL": 0x02,
        "ENGLISH": 0x03,
        "GERMAN": 0x04,
        "RUSSIAN": 0x05,
        "SPANISH": 0x06,
        "PORTUGUESE": 0x07,
        "FRENCH": 0x08,
        "JAPANESE": 0x09,
        "ARABIC": 0x0A,
        "HINDI": 0x13,
        "BENGALI": 0x0D,
        "TAMIL": 0x41,
        "TELUGU": 0x43,
        "MARATHI": 0x40,
        "URDU": 0x1F,
        "KANNADA": 0x3D,
        "MALAYALAM": 0x3F,
      ]
    ]
  }
  
  


    override func supportedEvents() -> [String]! {
        return [
            "FC_Discovered",
            "FC_DiscoveredUpdated",
            "FC_ScanStopped",
            "FC_Connected",
            "FC_ConnectFailed",
            "FC_WriteReady",
            "FC_BindResult",
            "onBluetoothStateChanged"
        ]
    }

    // MARK: Register Notification Observers
    func registerObservers() {
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(onPeripheralDiscovered(_:)),
            name: NSNotification.Name(FITCLOUDEVENT_PERIPHERAL_DISCOVERED_NOTIFY),
            object: nil
        )

        NotificationCenter.default.addObserver(
            self,
            selector: #selector(onPeripheralUpdated(_:)),
            name: NSNotification.Name(FITCLOUDEVENT_PERIPHERAL_DISCOVERED_UPDATED_NOTIFY),
            object: nil
        )

        NotificationCenter.default.addObserver(
            self,
            selector: #selector(onScanStopped(_:)),
            name: NSNotification.Name(FITCLOUDEVENT_PERIPHERAL_SCANSTOP_NOTIFY),
            object: nil
        )

        NotificationCenter.default.addObserver(
            self,
            selector: #selector(onConnected(_:)),
            name: NSNotification.Name(FITCLOUDEVENT_PERIPHERAL_CONNECTED_NOTIFY),
            object: nil
        )

        NotificationCenter.default.addObserver(
            self,
            selector: #selector(onConnectFailed(_:)),
            name: NSNotification.Name(FITCLOUDEVENT_PERIPHERAL_CONNECT_FAILURE_NOTIFY),
            object: nil
        )

        NotificationCenter.default.addObserver(
            self,
            selector: #selector(onWriteReady(_:)),
            name: NSNotification.Name(FITCLOUDEVENT_PERIPHERAL_WRITECHARACTERISTIC_READY_NOTIFIY),
            object: nil
        )
      
      NotificationCenter.default.addObserver(
          self,
          selector: #selector(bindResult(_:)),
          name: NSNotification.Name(FITCLOUDEVENT_BINDUSEROBJECT_RESULT_NOTIFY),
          object: nil
      )
      
      NotificationCenter.default.addObserver(
          self,
          selector: #selector(checkblootooth(_:)),
          name: NSNotification.Name(FITCLOUDEVENT_CENTRALMANAGER_DIDUPDATESTATE_NOTIFY),
          object: nil
      )
      
    
    }

    // MARK: Start Scan
    @objc func startScan() {
      scannedPeripherals.removeAll()
        FitCloudKit.startScan()
    }

    // MARK: Stop Scan
    @objc func stopScan() {
        FitCloudKit.stopScan()
    
    }

    // MARK: Connect
  @objc(connect:userId:randomCode:)
  func connect(_ uuid: String, userId: String, randomCode: String) {
    print("data is coming from js",uuid, userId, randomCode)
      guard let item = scannedPeripherals[uuid] else {
                 print("FC_CONNECT_FAILED", ["error": "Peripheral not found in scanned list"])
                 return
             }

             FitCloudKit.connectAndBind(
              item.peripheral,
                 userId: userId,
                 randomCode: randomCode,
                 withClassicBT: false
             )
    }

    // MARK: Notifications → JS Events

    @objc func onPeripheralDiscovered(_ notification: Notification) {
        guard let item = notification.object as? FitCloudPeripheral else { return }
      
      let uuidString = item.peripheral.identifier.uuidString

      // Only add if it doesn't already exist
      if scannedPeripherals[uuidString] == nil {
          scannedPeripherals[uuidString] = item
      }

        sendEvent(withName: "FC_Discovered", body: [
            "uuid": item.peripheral.identifier.uuidString,
            "name": item.peripheral.name ?? "",
            "rssi": item.rssi ?? 0
        ])
    }
  
  @objc func disconnect(){
    FitCloudKit.disconnect()
  }
  
    @objc func onPeripheralUpdated(_ notification: Notification) {
        guard let item = notification.object as? FitCloudPeripheral else { return }

        sendEvent(withName: "FC_DiscoveredUpdated", body: [
            "uuid": item.peripheral.identifier.uuidString,
            "name": item.peripheral.name ?? "",
            "rssi": item.rssi ?? 0
        ])
    }
  
  @objc func checkblootooth(_ notification: Notification){
    if let state = notification.userInfo?["state"] as? Int {
               sendEvent(withName: "onBluetoothStateChanged", body: ["state": state])
           }
  }

    @objc func onScanStopped(_ notification: Notification) {
        sendEvent(withName: "FC_ScanStopped", body: [])
    }
  
  

    @objc func onConnected(_ notification: Notification) {
        guard let item = notification.object as? FitCloudPeripheral else { return }
        sendEvent(withName: "FC_Connected", body: [
            "uuid": item.peripheral.identifier.uuidString
        ])
    }

    @objc func onConnectFailed(_ notification: Notification) {
        sendEvent(withName: "FC_ConnectFailed", body: [])
    }

    @objc func onWriteReady(_ notification: Notification) {
        sendEvent(withName: "FC_WriteReady", body: [])
    }
    
    @objc func bindResult(_ notification: Notification) {
        // object: NSNumber userId
        // userInfo: { "result": BOOL, "error": NSError, "audioBluetooth": NSString }
        let userId: Int? = (notification.object as? NSNumber)?.intValue

        let userInfo = notification.userInfo ?? [:]
        let result = (userInfo["result"] as? NSNumber)?.boolValue ?? false
        let error = userInfo["error"] as? NSError
        let audioBluetooth = userInfo["audioBluetooth"] as? String

        var body: [String: Any] = [
            "result": result,
        ]
        if let userId = userId { body["userId"] = userId }
        if let audioBluetooth = audioBluetooth { body["audioBluetooth"] = audioBluetooth }
        if let error = error {
            body["error"] = [
                "code": error.code,
                "domain": error.domain,
                "message": error.localizedDescription
            ]
        }

        sendEvent(withName: "FC_BindResult", body: body)
    }
  
    @objc func isUserAlreadyBound(_ userId: String, callback: RCTResponseSenderBlock) {
    
//      let isDeviceBound = FitCloudKit.isUserAlreadyBound(userId)
      let isDeviceBound = FitCloudKit.alreadyBound()
      print("FC_CONNECT_FAILED", userId,isDeviceBound)
      callback([isDeviceBound])
    }
  
   @objc func watchIsConnected(_ callback: RCTResponseSenderBlock) {
      let isDeviceConnected = FitCloudKit.isConnected()
      callback([isDeviceConnected])
    }
  
  @objc func boundUserData(_ callback: RCTResponseSenderBlock) {
    let isDeviceConnected = FitCloudKit.userBindStatus()
     callback([isDeviceConnected])
   }
  
  @objc func getFirmware(_ callback: RCTResponseSenderBlock) {
    let firmware = FitCloudKit.firmwareFullVersion()
    if let firmware = firmware {
      callback([firmware])
    } else {
      callback([NSNull()])
    }
   }
//  @objc func getModelName(_ callback: RCTResponseSenderBlock) {
//    let firmware = FitCloudKit.watchUIInformation()
//    if let firmware = firmware {
//      callback([firmware])
//    } else {
//      callback([NSNull()])
//    }
//   }
  
    @objc(addUser:resolver:rejecter:)
    func addUser(
      _ userDict: NSDictionary, resolver: @escaping RCTPromiseResolveBlock,
      rejecter: @escaping RCTPromiseRejectBlock
    ) {
 
      //    FitCloudKit.setUserProfile(user)
      let profile = FitCloudUserProfileObject()

          // Convert values safely
      if let ageValue = userDict["age"] as? NSNumber {
          profile.age = UInt8(ageValue.intValue)
      }

      // Convert height → Float
      if let heightValue = userDict["height"] as? NSNumber {
          profile.height = Float(heightValue.floatValue)
      }

      // Convert weight → Float
      if let weightValue = userDict["weight"] as? NSNumber {
          profile.weight = Float(weightValue.floatValue)
      }
      let genderNumber = userDict["gender"] as? NSNumber
      if let gender = genderNumber.flatMap({
          FITCLOUDGENDER(rawValue: UInt8($0.intValue))
      }) {
        profile.gender = gender
      }
      
      FitCloudKit.setUserProfile(profile) { success, error in
        if success {
  
          var result: [String: Any] = [
            "success": true,
            "userId": userDict["userId"] ?? "",
          ]
  
          result["profile"] = [
            "age": profile.age,
            "gender": profile.gender,
            "height": profile.height,
            "weight": profile.weight,
        
          ]
  
          resolver(result)
          print("Profile updated!", result)
        } else {
          let nsError = error as NSError?
          let code = "\(nsError?.code ?? -1)"  // convert Int to String
          let message = error?.localizedDescription ?? "Unknown error"
          rejecter(code, message, error)
  
          print("Error:", error?.localizedDescription ?? "")
        }
      }
  
    }
  
  @objc
   func syncLanguageToWatch(
     _ language: NSNumber,
     resolver resolve: @escaping RCTPromiseResolveBlock,
     rejecter reject: @escaping RCTPromiseRejectBlock
   ) {

     let rawValue = UInt8(language.intValue)

     guard let lang = FITCLOUDLANGUAGE(rawValue: rawValue) else {
       reject(
         "INVALID_LANGUAGE",
         "Invalid FITCLOUDLANGUAGE value: \(language)",
         nil
       )
       return
     }

     FitCloudKit.syncSpecificLanguage(toWatch: lang){ success, error in
       if let error = error {
         reject("LANG_SYNC_FAILED", error.localizedDescription, error)
       } else {
         resolve(success)
       }
     }
   }
  
  @objc(unbindUser:resolver:rejecter:)
  func unbindUser(
    _ shouldDisconnectWhenSuccess: NSNumber,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    let shouldDisconnect = shouldDisconnectWhenSuccess.boolValue
    FitCloudKit.unbindUserObject(shouldDisconnect) { success, error in
      if let error = error {
        reject("UNBIND_FAILED", error.localizedDescription, error)
      } else {
        resolve(success)
      }
    }
  }
}

