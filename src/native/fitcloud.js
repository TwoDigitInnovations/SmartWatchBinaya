import { NativeModules, NativeEventEmitter } from "react-native";

const { FitCloudProModule } = NativeModules;
const emitter = new NativeEventEmitter(FitCloudProModule);

// LISTEN TO EVENTS
// emitter.addListener("onScanResult", devices => {
//     console.log("Devices:", devices);
// });

// emitter.addListener("FC_DeviceConnected", e => {
//     console.log("Connect state:", e.state);
// });

emitter.addListener("onFindPhone", e => {
    console.log("Connect state:", e.state);
});

emitter.addListener("FC_DeviceFound", (e) => {

    console.log("Watch is trying to find your phone!", e);

});
emitter.addListener("FC_TodaySteps", (e) => {

    console.log("FC_TodaySteps", e);

});

// METHODS
export default {
    startScan() {
        console.log("Starting scan...", FitCloudProModule);
        FitCloudProModule.startScan();
    },
    stopScan() {
        FitCloudProModule.stopScan();
    },
    connect(mac) {
        FitCloudProModule.connect(mac);
    },
    getStepData() {
        FitCloudProModule.getStepData();
    },
    disconnect() {
        // FitCloudProModule.disconnect();
    },
    takePhoto() {
        // FitCloudProModule.takePhoto();
    },
    sendASRData(data) {
        // FitCloudProModule.sendASRData(data);
    },
    isDeviceBound() {
        // FitCloudProModule.isUserAlreadyBound(value => {
        //     console.log("Is device bound:", value);
        // });
    },

    setUserProfile(user, userDetails) {
        // FitCloudProModule.addUser(user)
        //     .then(() => {
        //         console.log("Is device bound:", value);
        //         userDetails(value)
        //     }).catch(error => {
        //         console.log("Error setting user profile:", error);
        //     });
    },
};
