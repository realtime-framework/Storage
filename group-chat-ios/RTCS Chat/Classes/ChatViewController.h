//
//  ChatViewController.h
//  RTCS Chat
//
//  Created by iOSdev on 11/7/13.
//  Copyright (c) 2013 Realtime.co. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "StorageManager.h"
#import "ComposeViewController.h"
#import "MessageTableViewCell.h"

@interface ChatViewController : UIViewController <UITableViewDelegate, UITableViewDelegate, ComposeDelegate>


@property (strong, nonatomic) NSMutableArray *items;
@property (weak, nonatomic) IBOutlet UITableView *myTableView;
@property (strong, nonatomic) UITextField *myNewChatRoomTextField;
@property (strong, nonatomic) MessageTableViewCell *longPressedCell;
@property (strong, nonatomic) UIActivityIndicatorView *myActivityIndicator;
@property (readwrite, nonatomic) BOOL didAppearOnce;

- (void) getItemsForChatRoom:(NSString *) chatRoom;
- (void) receivedMessage:(NSDictionary *) message OnChatRoom:(NSString *) chatRoom;
- (void) deletedMessage:(NSDictionary *) message OnChatRoom:(NSString *) chatRoom;

@end
