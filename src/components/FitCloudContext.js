import React, { createContext, useEffect, useState } from "react";
import { NativeModules, NativeEventEmitter, Platform } from "react-native";
import { FitCloudGoalProvider } from "./FitcloudGoal";
import { FitCloudStepProvider } from "./FitCloudSteps";
import { reset } from "../../navigationRef";
import DeviceInfo from 'react-native-device-info';
import { insertUser, insert } from "../db/Dao/UserDao";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { requestBlePermissions } from "./reuestPermissonBle";

const { FitCloudProModule, FitCloudStepsModule } = NativeModules;
const emitter = new NativeEventEmitter(FitCloudProModule);
const stepemitter = new NativeEventEmitter(FitCloudStepsModule);

export const FitCloudContext = createContext();

export const FitCloudProvider = ({ children }) => {

  const [connected, setConnected] = useState(false);
  const [devices, setDevices] = useState([]);
  const [user, setUser] = useState({});
  const [connectingDevice, setConnectingDevice] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [isWatchReady, setIswatchReady] = useState(false);

  useEffect(() => {
    console.log("FC Context Mounted");

    // const FC_DeviceConnected = emitter.addListener("FC_DeviceConnected", e => {
    //   setConnected(e?.state === 1);
    //   console.log("Device connect state:", e);
    // });

    const FC_DeviceFound = emitter.addListener("FC_Discovered", e => {
      console.log("Device found:", e);
      setDevices(prev => {
        if (!prev.find(d => (d?.uuid && d.uuid === e?.uuid))) {
          return [...prev, e];
        }
        return prev;
      });
    });
    let errSub = null;
    let FC_watchstatus = null;
    if (Platform.OS === 'android') {
      errSub = emitter.addListener('onScanFailed', (err) => {
        console.log('Scan failed:', err); // { errorCode, message }
      });

      FC_watchstatus = emitter.addListener("FC_watchstatus", e => {
        console.log("FC_watchstatus checked:", e);

      });
    }



    const FC_DeviceConnecting = emitter.addListener("FC_DiscoveredUpdated", e => {
      console.log("Device found:", e);
      setDevices(prev => {
        if (!prev.find(d => (d?.uuid && d.uuid === e?.uuid))) {
          return [...prev, e];
        }
        return prev;
      });

    });

    const onBluetoothStateChanged = emitter.addListener("onBluetoothStateChanged", e => {
      console.log("onBluetoothStateChanged", e);
    });



    const FC_DeviceDisconnected = emitter.addListener("FC_Connected", e => {
      console.log("FC_Connected:", e);
      setConnected(e?.state === 1);
    });



    const FC_DeviceConnectFailed = emitter.addListener("FC_ConnectFailed", e => {
      console.log("Connection failed:", e);
    });

    const FC_check = emitter.addListener("FC_WriteReady", e => {
      console.log("FC_WriteReady checked:", e);
      setIswatchReady(true)
    });

    const FC_BindResult = emitter.addListener("FC_BindResult", e => {
      console.log("FC_BindResult checked:", e);
      setConnectingDevice(null);
      reset('App');
    });





    // initSDK();

    return () => {
      // FC_DeviceConnected.remove();
      FC_DeviceFound.remove();
      FC_DeviceConnecting.remove();
      FC_DeviceDisconnected.remove();
      FC_DeviceConnectFailed.remove();
      FC_check.remove();
      FC_BindResult.remove();
      onBluetoothStateChanged.remove()
      if (errSub) {
        errSub.remove()
      }
      if (FC_watchstatus) {
        FC_watchstatus.remove()
      }

      setIswatchReady(false)
    };
  }, []);

  const isPlatformSupported = () => {
    console.log('isPlatformSupported', Platform.OS);
    // return Platform.OS === 'ios';
  }


  const initSDK = async () => {
    // console.warn('isPlatformSupported', isPlatformSupported());
    // if (Platform.OS === 'android') {
    // console.warn('⚠️ FitCloud SDK only available on iOS currently');
    // throw new Error('Android SDK not implemented yet. Please use iOS.');
    try {
      console.log('Initializing FitCloud SDK...');
      const result = await FitCloudProModule.initSDK();
      isInitialized = true;
      console.log('SDK initialized:', result);
      FitCloudProModule.watchIsConnected(data => { console.log("Is watch connected:", data) });
      return result;
    } catch (error) {
      console.error('SDK initialization failed:', error);
      throw error;
    }
    // }


  }

  const api = {
    // configration sdk
    startScan: async () => {
      const granted = await requestBlePermissions();
      if (!granted) {
        console.warn('BLE permissions denied');
        return;
      }
      FitCloudProModule.startScan();
      console.log('scan started=================>');
    },
    stopScan: () => FitCloudProModule.stopScan(),
    connect: async (mac) => {
      let id = ''
      const deviceId = await AsyncStorage.getItem('userId');
      if (deviceId) {
        id = deviceId;
      } else {
        id = await DeviceInfo.getUniqueId();
        AsyncStorage.setItem('userId', id);
      }
      let code = Math.floor(100000 + Math.random() * 900000).toString();
      FitCloudProModule.connect(mac, id, code)
      await insertUser({
        name: 'unknown',
        email: 'unknown',
        gender: "male",
        dob: new Date().toISOString().split('T')[0],
        height: 170,
        weight: 65,
        avatar: '../assets/images/avatar.png',
        userId: id,
        id: '0001',
        code,
        age: 1,
      });
      // await insert({
      //   userId: id,
      //   code: code
      // })
    },
    disconnect: () => FitCloudProModule.disconnect(),
    unbindUser: async (type, res) => {
      try {
        const d = await FitCloudProModule.unbindUser(type);
        res(d)
      } catch (err) {
        console.log("Unbind error:", err);
        res(err)
      }
    },
    boundUserData: data => { FitCloudProModule.boundUserData(data => { console.log("Is watch connected:", data) }) },
    addUser: data => updateProfile(data),
    setLanguage: data => setLanguageFormWatch(data),
    watchIsConnected: () => FitCloudProModule.watchIsConnected(data => { console.log("Is watch connected:", data) }),
    isUserAlreadyBound: async (id, res) => {
      FitCloudProModule.isUserAlreadyBound(id, (data) => { console.log("Is user already bound:", data), res(data) })
    },
    getFirmware: async (res) => {
      FitCloudProModule.getFirmware((data) => { console.log("Is user already bound:", data), res(data) })
    },

  };

  const setLanguageFormWatch = (data) => {
    FitCloudProModule.syncLanguageToWatch(
      FitCloudProModule.LANGUAGE.ENGLISH
    )
      .then(() => {
        console.log('Language synced successfully');
      })
      .catch(err => {
        console.error('Language sync failed', err);
      });

  }

  const updateProfile = (data) => {
    console.log("Updating profile with data:", data);
    FitCloudProModule.addUser(data)
      .then(res => {
        console.log("Profile updated:", res);
        setUser(data);
      }
      )
      .catch(err => {
        console.log("Profile update error:", err);
      });
  }

  return (
    <FitCloudContext.Provider value={{
      connected,
      devices,
      api,
      setDevices,
      connectingDevice,
      setConnectingDevice,
      userDetails,
      setUserDetails,
      isWatchReady
    }}>
      <FitCloudStepProvider setUserDetails={setUserDetails} userDetails={userDetails} />
      <FitCloudGoalProvider />
      {children}
    </FitCloudContext.Provider>
  );
};
