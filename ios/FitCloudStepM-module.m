//
//  FitCloudStepM-module.m
//  smartwatchios
//
//  Created by Kaklotar Chetan on 16/12/25.
//



#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(FitCloudStepsModule, RCTEventEmitter)

RCT_EXTERN_METHOD(getStepData)
RCT_EXTERN_METHOD(syncAllDataThenEmitToday)
RCT_EXTERN_METHOD(requestLatestHealthMeasurementData:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(getDashboardHealthData:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(queryAppUsageCountStatistics:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(queryBatteryInfo:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)

@end

