//
//  ComposeViewController.h
//  RTCS Chat
//
//  Created by iOSdev on 11/12/13.
//  Copyright (c) 2013 Realtime.co. All rights reserved.
//

#import <UIKit/UIKit.h>

// The delegate protocol for the Compose screen
@protocol ComposeDelegate <NSObject>
- (void) didComposeMessage:(NSString *)message ToChatRoom:(NSString *) chatRoom;
@end

// The Compose screen lets the user write a new message
@interface ComposeViewController : UIViewController <UITextViewDelegate>

@property (nonatomic, assign) id<ComposeDelegate> delegate;

@property (nonatomic, strong) NSString *chatRoom;
@property (nonatomic, weak) IBOutlet UITextView *messageTextView;
@property (nonatomic, weak) IBOutlet UIBarButtonItem *saveItem;
@property (nonatomic, weak) IBOutlet UINavigationBar *navigationBar;
@property (weak, nonatomic) IBOutlet UIView *contentView;

- (void)updateBytesRemaining:(NSString*)text;

@end
