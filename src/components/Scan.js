import React, { useContext, useEffect, useState } from "react";
import { PermissionsAndroid, Platform, View, Text, Button, FlatList, TouchableOpacity, Alert } from "react-native";

import { FitCloudContext } from "./FitCloudContext";
import { getStepData, syncAllDataThenEmitToday } from "./FitCloudSteps"
import { goalData, fetchTodayOverview, setDailyGoal } from "./FitcloudGoal"



export default function Scan() {
    // const [devices, setDevices] = useState([]);
    const [connectedDevice, setConnectedDevice] = useState(null);
    const { api, devices, setDevices } = useContext(FitCloudContext);




    console.log("Rendering App", devices);
    // Android permissions
    const requestPermissions = async () => {
        if (Platform.OS === "android") {
            await PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
            ]);
        }
    };



    const startScan = async () => {
        setDevices[[]]
        await requestPermissions();
        api.startScan();
        return
    };

    const connectToDevice = async (device) => {
        try {
            api.connect(device.uuid);
        } catch (err) {
            console.log("Connection error:", err);
        }
    };



    const login = () => {
        api.addUser(
            {
                age: 25,
                height: 175,
                weight: 70,
                gender: 'MALE',
                userId: "mobile_9904686607"
            }
        );
    }

    const setDailydata = () => {
        setDailyGoal(
            {
                steps: 8000,         // Int: step goal
                distanceKm: 5.5,     // Double: kilometers
                calorieKCal: 500,    // Double: kilocalories
                durationMinutes: 0,  // Int (optional)
                timestampMs: Date.now()
            }
        );
    }


    return (
        <View style={{ flex: 1, padding: 20 }}>
            <Button title="Scan for Devices" onPress={startScan} />

            <Button title="Login" onPress={login} />
            <Button title="Get Steps" onPress={() => {
                getStepData()
            }} />

            <Button title="Sync Data" onPress={() => {
                syncAllDataThenEmitToday()
            }} />

            <Button title="All data" onPress={() => {
                goalData()
            }} />

            <Button title="Set data" onPress={setDailydata} />

            <Button title="Set Language" onPress={() => api.setLanguage()} />


            <FlatList
                data={devices}
                keyExtractor={(item) => item?.uuid}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={{ padding: 10, marginVertical: 5, borderWidth: 1 }}
                        onPress={() => connectToDevice(item)}
                    >
                        <Text style={{ color: 'white' }}>{item?.name}</Text>
                        <Text style={{ color: 'white' }}>{item?.uuid}</Text>
                    </TouchableOpacity>
                )}
            />


        </View>
    );
}
