//
//  FitCloudGoalM-module.m
//  smartwatchios
//
//  Created by Kaklotar Chetan on 16/12/25.
//

#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(FitCloudGoalsModule, RCTEventEmitter)

RCT_EXTERN_METHOD(fetchTodayOverview)
//RCT_EXTERN_METHOD(goalData)
RCT_EXTERN_METHOD(setDailyGoal:(NSDirectonary *)goalDict resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(goalData:(RCTResponseSenderBlock)callback;)
RCT_EXTERN_METHOD(getDailyGoal:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)




@end
