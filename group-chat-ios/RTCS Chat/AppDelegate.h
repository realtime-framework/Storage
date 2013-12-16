//
//  AppDelegate.h
//  RTCS Chat
//
//  Created by iOSdev on 11/7/13.
//  Copyright (c) 2013 Realtime.co. All rights reserved.
//

#import <UIKit/UIKit.h>
#import <RealTimeCloudStorage/RealtimePushAppDelegate.h>
#import "RootViewController.h"


@interface AppDelegate : RealtimePushAppDelegate

@property (strong, nonatomic) UIWindow *window;
@property (readonly, strong, nonatomic) RootViewController *viewController;
@property (readonly, strong, nonatomic) UINavigationController *navigationController;

@end
