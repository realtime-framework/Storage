//
//  GameScene.m
//  BirdGame
//
//  Created by iOSdev on 12/21/13.
//  Copyright (c) 2013 Apportable. All rights reserved.
//

#import "GameScene.h"
#import "StorageManager.h"
#import "MessagingManager.h"
#import "SubmitScoreViewController.h"
#import <GLKit/GLKit.h>


@implementation GameScene


- (void) onEnterTransitionDidFinish {
	
	[super onEnterTransitionDidFinish];
	
	[[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(applicationNotification:) name:@"applicationWillResignActive" object:nil];
	[[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(applicationNotification:) name:@"applicationDidBecomeActive" object:nil];
		
	[[MessagingManager sharedManager] setMsgDelegate:self];
	[[MessagingManager sharedManager] subscribeChannelWithName:[[StorageManager sharedManager] gameID]];
	
	_timerLabel = [CCLabelTTF labelWithString:@"TIME: 0" fontName:@"HelveticaNeue-Bold" fontSize:32];
	_timerLabel.color = ccORANGE;
	_timerLabel.position = ccp (240,280);
	_timerLabel.shadowOffset = ccp (1,-1);
	_timerLabel.shadowColor = ccc4(25, 25, 25, 150);
	_timerLabel.shadowBlurRadius = 2.0;
	[self addChild:_timerLabel];
}



- (void) onExit {
	
	[super onExit];
	[[NSNotificationCenter defaultCenter] removeObserver:self];
}


- (void) sendMessage:(NSString *)msg
{
	if ([msg isEqualToString:[NSString stringWithFormat:@"ARUTHERE_%@", RIGHT_SIDE]] || [msg isEqualToString:@"JOINRESTART"]) {
		NSString *notificationsGameID = [NSString stringWithFormat:@"%@:Notifications", [[StorageManager sharedManager] gameID]];
		[[MessagingManager sharedManager] sendMessage:msg ToChannel:notificationsGameID];
	}
	else {
		[[MessagingManager sharedManager] sendMessage:msg ToChannel:[[StorageManager sharedManager] gameID]];
	}
}


- (int) calcScoreForTimeElapsed:(float) timeElapsed {
	
	// (e^(-x/100))*10000
	// (M_E^(-timeElapsed/100)) * 10000
	
	int score = 0;
	float floatScore = 0;
	
	floatScore = (pow(M_E, (-timeElapsed/100))) * 10000;
	score = (int)floor((floatScore + 0.5));
	
	NSLog(@"\n\n\nSCORE: (%f) %d", timeElapsed, score);
	return score;
}


- (void) showSubmitScore:(int) score {
	
	_submitScoreViewController = [[SubmitScoreViewController alloc] initWithNibName:@"SubmitScoreViewController" bundle:nil];
	_submitScoreViewController.score = score;
	_submitScoreViewController.view.frame = [[[CCDirector sharedDirector] view] frame];
	_submitScoreViewController.view.alpha = 0.0;
	
	
	AppController *mainDelegate = (AppController *) [[UIApplication sharedApplication] delegate];
	[mainDelegate.navController addChildViewController:_submitScoreViewController];
    [mainDelegate.navController.view addSubview:_submitScoreViewController.view];
    [_submitScoreViewController didMoveToParentViewController:mainDelegate.navController];
	
	[_submitScoreViewController.closeBtt addTarget:self action:@selector(removeScoresController:) forControlEvents:UIControlEventTouchUpInside];
	
	[UIView animateWithDuration:0.350 animations:^{
		_submitScoreViewController.view.alpha = 1.0;
	} completion:nil];
}


- (void) removeScoresController:(id) sender {
	
	[UIView animateWithDuration:0.20 animations:^{
		[_submitScoreViewController view].alpha = 0.0;
	} completion:^(BOOL finished) {
		
		AppController *mainDelegate = (AppController *) [[UIApplication sharedApplication] delegate];
		[_submitScoreViewController willMoveToParentViewController:mainDelegate.navController];
		[_submitScoreViewController.view removeFromSuperview];
		[_submitScoreViewController removeFromParentViewController];
		_submitScoreViewController = nil;
	}];
}

@end
