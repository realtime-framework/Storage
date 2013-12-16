//
//  RootViewController.h
//  RTCS Chat
//
//  Created by iOSdev on 11/7/13.
//  Copyright (c) 2013 Realtime.co. All rights reserved.
//

#import <UIKit/UIKit.h>

#import "Reachability.h"
#import "StorageManager.h"
#import "RoomsTableViewController.h"


@interface RootViewController : UIViewController <UITextFieldDelegate, ChatRoomDelegate>

@property (strong, nonatomic) Reachability *internetReachable;
@property (strong, nonatomic) RoomsTableViewController *roomsTableViewController;
@property (readwrite, nonatomic) BOOL isInternetActive;

@property (weak, nonatomic) IBOutlet UIButton *chatRoomsBtt;
@property (weak, nonatomic) IBOutlet UILabel *statusLabel;
@property (weak, nonatomic) IBOutlet UITextField *nickNameTextField;
@property (weak, nonatomic) IBOutlet UILabel *welcomeLabel;
@property (strong, nonatomic) UIActivityIndicatorView *myActivityIndicator;


@end
