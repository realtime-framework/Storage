//
//  RoomsTableViewController.h
//  RTCS Chat
//
//  Created by iOSdev on 11/7/13.
//  Copyright (c) 2013 Realtime.co. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "StorageManager.h"


@interface RoomsTableViewController : UITableViewController <UITextFieldDelegate>

@property (strong, nonatomic) StorageManager *storageMng;
@property (strong, nonatomic) UITextField *myNewChatRoomTextField;


@end
