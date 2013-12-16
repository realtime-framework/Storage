//
//  SpeechBubbleView.h
//  RTCS Chat
//
//  Created by iOSdev on 11/8/13.
//  Copyright (c) 2013 Realtime.co. All rights reserved.
//

#import <UIKit/UIKit.h>

// The bubble type indicates whether it's a left-hand or right-hand bubble
typedef enum
{
	BubbleTypeLefthand = 0,
	BubbleTypeRighthand,
}
BubbleType;

// A UIView that shows a speech bubble
@interface SpeechBubbleView : UIView

// Calculates how big the speech bubble needs to be to fit the specified text
+ (CGSize)sizeForText:(NSString*)text;

// Configures the speech bubble
- (void)setText:(NSString*)text bubbleType:(BubbleType)bubbleType;

@end
