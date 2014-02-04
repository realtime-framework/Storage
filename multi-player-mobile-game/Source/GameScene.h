//
//  GameScene.h
//  BirdGame
//
//  Created by iOSdev on 12/21/13.
//  Copyright (c) 2013 Apportable. All rights reserved.
//

#import "CCNode.h"
#import "AppDelegate.h"
#import "MessagingManager.h"
#import "SubmitScoreViewController.h"
#import "DACircularProgressView.h"


enum gameStatus
{
	kGameNotInitiated,
    kGameRunning,
    kGamePaused
};


@interface GameScene : CCNode  <MessagingDelegate>
{
	CCLabelTTF *_timerLabel;
	CCButton *_restartBtt;
}


@property (readwrite, nonatomic) enum gameStatus gameStatus;
@property (retain, nonatomic) SubmitScoreViewController *submitScoreViewController;
@property (readwrite, nonatomic) int shootLeft;
@property (readwrite, nonatomic) int shootRight;


- (int) calcScoreForTimeElapsed:(float) timeElapsed;
- (void) showSubmitScore:(int) score;
- (void) receivedMSG:(NSString *) message onChannel:(NSString *) channel;
- (void) sendMessage:(NSString *)msg;


// Messaging Delegation
//- (void) receivedMSG:(NSString *) message onChannel:(NSString *) channel;


@end
