import React, { createContext, useEffect, useState } from "react";
import { NativeModules, NativeEventEmitter } from "react-native";

const { FitCloudGoalsModule } = NativeModules;
const goalEmitter = new NativeEventEmitter(FitCloudGoalsModule);


export const FitCloudGoalProvider = ({ children }) => {

    const [connected, setConnected] = useState(false);
    const [devices, setDevices] = useState([]);
    const [user, setUser] = useState({});

    useEffect(() => {
        /// step emiiter
        const FC_TodayOverview = goalEmitter.addListener("FC_TodayOverview", e => {
            console.log("FC_TodayOverview:", e);
        });

        const FC_Targets = goalEmitter.addListener("FC_Targets", e => {
            console.log("FC_Targets:", e);
        });


        return () => {

            FC_TodayOverview.remove();
            FC_Targets.remove();
        };
    }, []);
};



export const fetchTodayOverview = () => FitCloudGoalsModule.fetchTodayOverview();
export const goalData = () => FitCloudGoalsModule.goalData(data => { console.log(data) });
export const setDailyGoal = (data) => setDailyGoalFromJs(data);
export const getDailyGoal = (data) => {
    FitCloudGoalsModule.getDailyGoal().then(res => {
        console.log("getDailyGoal data:", res);
        data(res);
    }).catch(err => {
        console.log("getDailyGoal error:", err);
    })
};

const setDailyGoalFromJs = (data) => {
    console.log("Updating profile with data:", data);
    console.log('Types:', {
        steps: typeof data.steps,
        distanceKm: typeof data.distanceKm,
        calorieKCal: typeof data.calorieKCal,
        durationMinutes: typeof data.durationMinutes,
        timestampMs: typeof data.timestampMs
    });
    FitCloudGoalsModule.setDailyGoal(data)
        .then(res => {
            console.log("setDailyGoal updated:", res);
        }
        )
        .catch(err => {
            console.log("setDailyGoal update error:", err);
        });
}