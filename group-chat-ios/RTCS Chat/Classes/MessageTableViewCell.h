//
//  MessageTableViewCell.h
//  RTCS Chat
//
//  Created by iOSdev on 11/8/13.
//  Copyright (c) 2013 Realtime.co. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "SpeechBubbleView.h"

@interface MessageTableViewCell : UITableViewCell {
    
    SpeechBubbleView *_bubbleView;
	UILabel *_label;
}


@property (nonatomic, strong) SpeechBubbleView *bubbleView;
@property (nonatomic, strong) UILabel *label;
@property (nonatomic, strong) NSDictionary *message;


@end
