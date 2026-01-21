import React, { createContext, useEffect, useState } from "react";
import { NativeModules, NativeEventEmitter } from "react-native";

const { FitCloudStepsModule } = NativeModules;
const stepemitter = new NativeEventEmitter(FitCloudStepsModule);


export const FitCloudStepProvider = ({ userDetails, setUserDetails }) => {


    useEffect(() => {
        /// step emiiter
        const FC_SyncProgress = stepemitter.addListener("FC_SyncProgress", e => {
            console.log("FC_SyncProgress checked:", e);

        });

        const FC_SyncFinished = stepemitter.addListener("FC_SyncFinished", e => {
            console.log("FC_check FC_SyncFinished:", e);
        });

        const FC_TodaySteps = stepemitter.addListener("FC_TodaySteps", e => {
            console.log("FC_TodaySteps:from step emitter", e);
            if (e.succeed) {
                setUserDetails({ ...userDetails, steps: e })
            }

        });




        return () => {

            FC_TodaySteps.remove();
            FC_SyncFinished.remove();
            FC_SyncProgress.remove();

        };
    }, []);
};

export const getStepData = (getData) => {
    // useEffect(() => {
    //     const FC_TodaySteps = stepemitter.addListener("FC_TodaySteps", e => {
    //         console.log("FC_TodaySteps:from step emitter", e);
    //         getData(e)
    //     });
    //     return () => {
    //         FC_TodaySteps.remove();
    //     }
    // }, [])

    FitCloudStepsModule.getStepData()
};
export const syncAllDataThenEmitToday = () => FitCloudStepsModule.syncAllDataThenEmitToday();
export const requestLatestHealthMeasurementData = async (res) => {
    const data = await FitCloudStepsModule.requestLatestHealthMeasurementData()
    res(data);
}

export const getDashboardHealthData = async (res) => {
    try {
        const data = await FitCloudStepsModule.getDashboardHealthData()
        res(data);
        // syncAllDataThenEmitToday()
    } catch (err) {
        console.log("Error in getLast7DaysStepData:", err);
    }

}

export const queryAppUsageCountStatistics = async (res) => {
    try {
        const data = await FitCloudStepsModule.queryAppUsageCountStatistics()
        res(data);
    } catch (err) {
        console.log("Error in queryAppUsageCountStatistics:", err);
    }

}

export const queryBatteryInfo = async (res) => {
    try {
        const data = await FitCloudStepsModule.queryBatteryInfo()
        res(data);
    } catch (err) {
        console.log("Error in queryBatteryInfo:", err);
    }

}
