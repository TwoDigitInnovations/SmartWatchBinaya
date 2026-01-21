import React, { createContext, useEffect, useState } from "react";
import { NativeModules, NativeEventEmitter } from "react-native";
import { FitCloudGoalProvider } from "./FitcloudGoal";
import { FitCloudStepProvider } from "./FitCloudSteps";
import { reset } from "../../navigationRef";
import DeviceInfo from 'react-native-device-info';
import { insertUser, insert } from "../db/Dao/UserDao";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
      setDevices(prev => {
        if (!prev.find(d => (d?.uuid && d.uuid === e?.uuid))) {
          return [...prev, e];
        }
        return prev;
      });
      console.log("Device found:", e);
    });

    const FC_DeviceConnecting = emitter.addListener("FC_DiscoveredUpdated", e => {
      setDevices(prev => {
        if (!prev.find(d => (d?.uuid && d.uuid === e?.uuid))) {
          return [...prev, e];
        }
        return prev;
      });
      console.log("Device found:", e);
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



    return () => {
      // FC_DeviceConnected.remove();
      FC_DeviceFound.remove();
      FC_DeviceConnecting.remove();
      FC_DeviceDisconnected.remove();
      FC_DeviceConnectFailed.remove();
      FC_check.remove();
      FC_BindResult.remove();
      onBluetoothStateChanged.remove()
      setIswatchReady(false)
    };
  }, []);

  const api = {
    // configration sdk
    startScan: () => FitCloudProModule.startScan(),
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
