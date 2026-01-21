//
//  FitCloudHealthM-module.m
//  smartwatchios
//
//  Created by Kaklotar Chetan on 16/12/25.
//
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(FitCloudHealthMonitorModule, RCTEventEmitter)

RCT_EXTERN_METHOD(fetchSportsDataToday)
RCT_EXTERN_METHOD(manualSyncData)
RCT_EXTERN_METHOD(getHealthTimingMonitorSetting:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(setHealthTimingMonitor:(NSDictionary)settings resolver(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)


@end
