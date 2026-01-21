//
//  FitCloudProModule.m
//  smartwatchios
//
//  Created by Chetan on 04/12/25.
//

#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(FitCloudProModule, RCTEventEmitter)

RCT_EXTERN_METHOD(startScan)
RCT_EXTERN_METHOD(stopScan)
RCT_EXTERN_METHOD(connect:(NSString *)uuid
                  userId:(NSString *)userId
                  randomCode:(NSString *)randomCode)
RCT_EXTERN_METHOD(disconnect)
RCT_EXTERN_METHOD(isUserAlreadyBound:(NSString *)userId callback:(RCTResponseSenderBlock)callback)
RCT_EXTERN_METHOD(addUser:(NSDictionary *)user resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(watchIsConnected:(RCTResponseSenderBlock)callback;)
RCT_EXTERN_METHOD(boundUserData:(RCTResponseSenderBlock)callback;)
RCT_EXTERN_METHOD(getFirmware:(RCTResponseSenderBlock)callback;)

RCT_EXTERN_METHOD(syncLanguageToWatch:(NSNumber)language resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(unbindUser:(NSNumber)shouldDisconnectWhenSuccess resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)

@end

