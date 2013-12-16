//
//  MessageTableViewCell.m
//  RTCS Chat
//
//  Created by iOSdev on 11/8/13.
//  Copyright (c) 2013 Realtime.co. All rights reserved.
//

#import "MessageTableViewCell.h"
#import "StorageManager.h"

@interface MessageTableViewCell()

@end

@implementation MessageTableViewCell

+ (void)initialize
{
	if (self == [MessageTableViewCell class])
	{
        // Custom init
    }
}

- (id)initWithStyle:(UITableViewCellStyle)style reuseIdentifier:(NSString*)reuseIdentifier
{
	if ((self = [super initWithStyle:style reuseIdentifier:reuseIdentifier]))
	{
		self.selectionStyle = UITableViewCellSelectionStyleNone;
        
		// Create the speech bubble view
		_bubbleView = [[SpeechBubbleView alloc] initWithFrame:CGRectZero];
        _bubbleView.backgroundColor = [UIColor clearColor];
		_bubbleView.opaque = YES;
		_bubbleView.clearsContextBeforeDrawing = NO;
		_bubbleView.contentMode = UIViewContentModeRedraw;
		_bubbleView.autoresizingMask = 0;
		[self.contentView addSubview:_bubbleView];
        
		// Create the label
		_label = [[UILabel alloc] initWithFrame:CGRectZero];
        _label.backgroundColor = [UIColor clearColor];
		_label.opaque = YES;
		_label.clearsContextBeforeDrawing = NO;
		_label.contentMode = UIViewContentModeRedraw;
		_label.autoresizingMask = 0;
		_label.font = [UIFont systemFontOfSize:13];
		_label.textColor = [UIColor colorWithRed:64/255.0 green:64/255.0 blue:64/255.0 alpha:1.0];
		[self.contentView addSubview:_label];
	}
	return self;
}

- (void)layoutSubviews
{
	// This is a little trick to set the background color of a table view cell.
	[super layoutSubviews];
    self.backgroundColor = [UIColor clearColor];
}

- (void)setMessage:(NSDictionary *) message
{
    //  - ChatRoom(name)    (NSString)  - primary key
    //  - timeStamp         (NSString)  - secondary key
    //  - nickName          (NSString)  - nick name of user who sends the message
    //  - message           (NSString)  - message sent
    //  - date              (NSString)  - local date of message sent
    
    //NSLog(@"\nChatRoom:(PRIMARY_KEY) %@ | SECONDARY_KEY: %@ | Date: %@ | From: %@ | %@", [message objectForKey:PRIMARY_KEY], [message objectForKey:SECONDARY_KEY], [message objectForKey:@"date"], [message objectForKey:@"nickName"], [message objectForKey:@"message"]);
    
    _message = [[NSDictionary alloc] initWithDictionary:message];
    
    // We display messages that are sent by the user on the left-hand side of
	// the screen. Incoming messages are displayed on the right-hand side.
    
    CGPoint point = CGPointZero;
	BubbleType bubbleType;
    CGSize bubbleSize = [SpeechBubbleView sizeForText:[message objectForKey:@"message"]];
    
	if ([[message objectForKey:@"nickName"] isEqualToString:[StorageManager sharedManager].nickName])
	{
        bubbleType = BubbleTypeLefthand;
        _label.textAlignment = NSTextAlignmentLeft;
    }
	else
	{
        bubbleType = BubbleTypeRighthand;
        point.x = self.bounds.size.width - bubbleSize.width;
        _label.textAlignment = NSTextAlignmentRight;
    }
    
    // Resize the bubble view and tell it to display the message text
	CGRect rect;
	rect.origin = point;
	rect.size = bubbleSize;
	_bubbleView.frame = rect;
	[_bubbleView setText:[message objectForKey:@"message"] bubbleType:bubbleType];
    
    // Set the sender's name and date on the label
	_label.text = [NSString stringWithFormat:@"%@ @ %@", [message objectForKey:@"nickName"], [message objectForKey:@"date"]];
    _label.textColor = [UIColor whiteColor];
	[_label sizeToFit];
	_label.frame = CGRectMake(8, bubbleSize.height, self.contentView.bounds.size.width - 16, 16);
}


@end
