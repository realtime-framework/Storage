//
//  GameSceneNoPhysics.m
//  BirdGame
//
//  Created by iOSdev on 12/30/13.
//  Copyright (c) 2013 Apportable. All rights reserved.
//

#import "GameSceneNoPhysics.h"

@implementation GameSceneNoPhysics

- (void) onEnter {
	
	[super onEnter];
	[[CCDirector sharedDirector] pause];
	
	super.gameStatus = kGamePaused;
}

- (void) onEnterTransitionDidFinish {
	
	[super onEnterTransitionDidFinish];
	_rightBtt.userInteractionEnabled = NO;
	
	_statusLabel = [CCLabelTTF labelWithString:@"Waiting for opponent" fontName:@"HelveticaNeue-Bold" fontSize:32];
	_statusLabel.color = ccORANGE;
	_statusLabel.position = ccp (240,240);
	_statusLabel.shadowOffset = ccp (1,-1);
	_statusLabel.shadowColor = ccc4(25, 25, 25, 150);
	_statusLabel.shadowBlurRadius = 2.0;
	
	[self addChild:_statusLabel];
	
	[super sendMessage:[NSString stringWithFormat:@"ARUTHERE_%@", RIGHT_SIDE]];
	_waitingTimer = [NSTimer scheduledTimerWithTimeInterval:60.0 target:self
												   selector:@selector(cancelGame) userInfo:nil repeats:NO];
}



- (void) onExitTransitionDidStart {
	
	[super onExitTransitionDidStart];
	[_waitingTimer invalidate];
	_waitingTimer = nil;
}


- (void) backAction {
	
	if (super.gameStatus == kGameRunning) {
		NSRange rangeSpace = [_timerLabel.string rangeOfString:@" "];
		NSString *scoreString = [NSString stringWithFormat:@"%@",[_timerLabel.string substringFromIndex:rangeSpace.location + 1]];
		
		NSString *message = [NSString stringWithFormat:@"GMOV_%@_%d", LEFT_SIDE, [super calcScoreForTimeElapsed:[scoreString floatValue]]];
		[super sendMessage:message];
	}
	[self abandonGame];
}

- (void) abandonGame {
	
	[_progressViewRight removeFromSuperview];
	NSString *gameID = [[StorageManager sharedManager] gameID];
	[[MessagingManager sharedManager] unSubscribeChannelWithName:gameID];
	
	[[StorageManager sharedManager] setGameIdOpponent:gameID OnTable:NO];
	super.gameStatus = kGameNotInitiated;
	[[CCDirector sharedDirector] replaceScene:[CCBReader sceneWithNodeGraphFromFile:@"MainScene"]];
}


- (void) setScene {
	
	NSLog(@"SET SCENE");
	_rightBtt.userInteractionEnabled = YES;
	
	[_statusLabel removeFromParent];
	[[CCDirector sharedDirector] resume];
	
	super.gameStatus = kGameRunning;
	
	_progressViewRight = [[DACircularProgressView alloc] initWithFrame:CGRectMake(425, 270, 20.0, 20.0)];
    _progressViewRight.roundedCorners = YES;
	_progressViewRight.alpha = 0.50;
    _progressViewRight.trackTintColor = [UIColor colorWithWhite:1.0 alpha:0.75];
	_progressViewRight.progressTintColor = [UIColor redColor];
	_progressViewRight.progress = 1.0;
	[[[CCDirector sharedDirector] view] addSubview:_progressViewRight];
}


- (void) launchBird:(id) sender
{
	// calc Rotation
	float rotationRadians = 0;
	
	rotationRadians = CC_DEGREES_TO_RADIANS(_launcherRight.rotation);
	_rightBtt.userInteractionEnabled = NO;
	
	NSString *message = [NSString stringWithFormat:@"SHOOT_%@_%d_%f", RIGHT_SIDE, [super shootRight], rotationRadians];
	[super sendMessage:message];
}


- (void) player:(NSString *)side DidShoot:(int) shoot WithAngle:(float) angle {
	
	CGPoint dirVector = ccp(sinf(angle), cosf(angle));
	CGPoint ballOffset = ccpMult(dirVector, 40);
	
	if ([side isEqualToString:LEFT_SIDE]) {
		
		[super setShootLeft:shoot + 1];
		
		_ball_left = [CCBReader nodeGraphFromFile:@"BirdNoPh"];
		_ball_left.scale = 0.50;
		_ball_left.position = ccpAdd(_launcherLeft.position, ballOffset);
		
		//add ball to node
		[self addChild:_ball_left];
		[_ball_left performSelector:@selector(removeFromParent) withObject:nil afterDelay:2.25];
		
	}
	else if ([side isEqualToString:RIGHT_SIDE]) {
		
		[super setShootRight:shoot + 1];
		
		_ball_right = [CCBReader nodeGraphFromFile:@"BirdNoPh"];
		_ball_right.scale = 0.50;
		_ball_right.position = ccpAdd(_launcherRight.position, ballOffset);
		
		//add ball to node
		[self addChild:_ball_right];
		[_ball_right performSelector:@selector(removeFromParent) withObject:nil afterDelay:2.25];
		
		[self scheduleOnce:@selector(enableRightBtt:) delay:2.25];
		if ([_progressTimer isValid]) {
			[self stopProgressViewAnimation];
			[self startProgressViewAnimation];
		}
		else {
			[self startProgressViewAnimation];
		}
	}
}


- (void) enableRightBtt:(CCTime) delta {
	[self unschedule:@selector(enableRightBtt:)];
	_rightBtt.userInteractionEnabled = YES;
}


- (void) gameOverWithWinner:(NSString *) winner AndScore:(int) score {
	
	NSLog(@"GAME OVER SIDE: %@", winner);
	
	[[CCDirector sharedDirector] pause];
	super.gameStatus = kGamePaused;
	[_progressViewRight removeFromSuperview];
	
	NSString *msg = nil;
	ccColor3B msgColor = ccGRAY;
	
	if ([winner isEqualToString:RIGHT_SIDE]) {
		msg = @"YOU WIN!";
		msgColor = ccGREEN;
		[super showSubmitScore:score];
	}
	else {
		msg = @"YOU LOSE!";
		msgColor = ccRED;
	}
	
	_timerLabel.string = [NSString stringWithFormat:@"SCORE: %d", score];
	
	_statusLabel = [CCLabelTTF labelWithString:msg fontName:@"HelveticaNeue-Bold" fontSize:32];
	_statusLabel.color = msgColor;
	_statusLabel.position = ccp (260,240);
	_statusLabel.shadowOffset = ccp (1,-1);
	_statusLabel.shadowColor = ccc4(25, 25, 25, 150);
	_statusLabel.shadowBlurRadius = 2.0;
	[self addChild:_statusLabel];
}


- (void) restartGame {
	_restartBtt.userInteractionEnabled = NO;
	if (super.gameStatus == kGamePaused) {
		[super sendMessage:@"JOINRESTART"];
	}
}


#pragma mark -
#pragma mark MessagingDelegate

- (void) receivedMSG:(NSString *) message onChannel:(NSString *) channel {
	
	//NSLog(@"MSG NO PH: %@\n\n", message);
	if (super.gameStatus == kGameRunning) {
		
		NSArray *messageChunks = [message componentsSeparatedByString:@"_"];
		if ([messageChunks count] > 1) {
			
			if ([[messageChunks objectAtIndex:0] isEqualToString:@"POS"]) {
				
				NSArray *blockPos = [[messageChunks objectAtIndex:1] componentsSeparatedByString:@"|"];
				NSArray *lbPos = [[messageChunks objectAtIndex:2] componentsSeparatedByString:@"|"];
				NSArray *rbPos = [[messageChunks objectAtIndex:3] componentsSeparatedByString:@"|"];
				
				//NSLog(@"\n %d | %d | BLOCK MSG: %@\n", [super shootLeft], [super shootRight], message);
				[_block setPosition:CGPointMake([[blockPos objectAtIndex:1] floatValue], [[blockPos objectAtIndex:2] floatValue])];
				[_block setRotation:[[blockPos objectAtIndex:3] floatValue]];
				
				if (_ball_left && [super shootLeft] == [[lbPos objectAtIndex:1] intValue]) {
					[_ball_left setPosition:CGPointMake([[lbPos objectAtIndex:2] floatValue], [[lbPos objectAtIndex:3] floatValue])];
					[_ball_left setRotation:[[lbPos objectAtIndex:4] floatValue]];
				}
				
				if (_ball_right && [super shootRight] == [[rbPos objectAtIndex:1] intValue]) {
					[_ball_right setPosition:CGPointMake([[rbPos objectAtIndex:2] floatValue], [[rbPos objectAtIndex:3] floatValue])];
					[_ball_right setRotation:[[rbPos objectAtIndex:4] floatValue]];
				}
				_timerLabel.string = [NSString stringWithFormat:@"TIME: %.1f", [[messageChunks objectAtIndex:4] floatValue]];
			}
			
			else if ([[messageChunks objectAtIndex:0] isEqualToString:@"SHOOT"]) {
				
				NSString *playerSide = [messageChunks objectAtIndex:1];
				int shoot = [[messageChunks objectAtIndex:2] intValue];
				NSString *angle = [messageChunks objectAtIndex:3];
				
				[self player:playerSide DidShoot:shoot WithAngle:[angle floatValue]];
			}
			else if ([[messageChunks objectAtIndex:0] isEqualToString:@"GMOV"] && super.gameStatus == kGameRunning) {
				//NSLog(@"GMOV MSG: %@\n\n", message);
				NSString *playerSide = [messageChunks objectAtIndex:1];
				[self gameOverWithWinner:playerSide AndScore:[[messageChunks objectAtIndex:2] intValue]];
			}
			
			else if ([[messageChunks objectAtIndex:0] isEqualToString:@"PAUSE"] && [[messageChunks objectAtIndex:1] isEqualToString:LEFT_SIDE]) {
				super.gameStatus = kGamePaused;
				[[CCDirector sharedDirector] pause];
				UIAlertView *alert = [[UIAlertView alloc] initWithTitle:nil message:@"Opponent is unavailable. Game is Paused" delegate:nil cancelButtonTitle:@"Ok" otherButtonTitles:nil];
				[alert show];
			}
		}
	}
	else {
		
		if (super.gameStatus == kGamePaused) {
			
			if ([message isEqualToString:@"STARTGAME"]) {
				[_waitingTimer invalidate];
				_waitingTimer = nil;
				[self setScene];
			}
			else if ([message isEqualToString:@"RESUME"]) {
				super.gameStatus = kGameRunning;
				[[CCDirector sharedDirector] resume];
			}
			else {
				NSArray *messageChunks = [message componentsSeparatedByString:@"_"];
				if ([messageChunks count] > 1) {
					
					if ([[messageChunks objectAtIndex:0] isEqualToString:@"ARUTHERE"] && [[messageChunks objectAtIndex:1] isEqualToString:LEFT_SIDE]) {
						[super sendMessage:[NSString stringWithFormat:@"IMHERE_%@", RIGHT_SIDE]];
					}
					else if ([[messageChunks objectAtIndex:0] isEqualToString:@"IMHERE"] && [[messageChunks objectAtIndex:1] isEqualToString:LEFT_SIDE]) {
						[super sendMessage:@"STARTGAME"];
					}
				}
			}
		}
		if ([message isEqualToString:@"RESTART"]) {
			
			UIAlertView *alert = [[UIAlertView alloc] initWithTitle:nil message:@"Opponent Wants to Restart Game. Do You??" delegate:self cancelButtonTitle:@"No" otherButtonTitles:@"Yes", nil];
			alert.tag = 0;
			[alert show];
		}
		else if ([message isEqualToString:@"OKRESTART"]) {
			[[CCDirector sharedDirector] replaceScene:[CCBReader sceneWithNodeGraphFromFile:@"GameSceneNoPh"]];
		}
		
		else if ([message isEqualToString:@"NORESTART"]) {
			
			UIAlertView *alert = [[UIAlertView alloc] initWithTitle:nil message:@"Opponent Rejected Restart Game" delegate:self cancelButtonTitle:@"Ok" otherButtonTitles:nil];
			alert.tag = 1;
			[alert show];
		}
	}
	if ([message isEqualToString:@"KICKOUT"] && ![channel isEqualToString:[[StorageManager sharedManager] myGameID]]) {
		[[StorageManager sharedManager] setKickOut:YES];
		[self abandonGame];
	}
}


- (void) cancelGame {
	
	if (super.gameStatus != kGameRunning) {
		UIAlertView *alert = [[UIAlertView alloc] initWithTitle:nil message:@"Opponent is not Available to play!" delegate:self cancelButtonTitle:@"Ok" otherButtonTitles:nil];
		alert.tag = 1;
		[alert show];
	}
	else {
		[_waitingTimer invalidate];
		_waitingTimer = nil;
	}
}



- (void) applicationNotification:(NSNotification *)notification {
	
	if ([[notification name] isEqual:@"applicationWillResignActive"]) {
		super.gameStatus = kGamePaused;
		[self sendMessage:[NSString stringWithFormat:@"PAUSE_%@", RIGHT_SIDE]];
	}
	
	if ([[notification name] isEqual:@"applicationDidBecomeActive"]) {
		[self sendMessage:@"RESUME"];
	}
}


#pragma mark -
#pragma mark UIAlertView delegation

- (void)alertView:(UIAlertView *)alertView clickedButtonAtIndex:(NSInteger)buttonIndex
{
	if (alertView.tag == 0) {
		if (buttonIndex == 0) {
			[super sendMessage:@"NORESTART"];
			_restartBtt.userInteractionEnabled = YES;
		}
		if (buttonIndex == 1) {
			[super sendMessage:@"OKRESTART"];
		}
	}
	if (alertView.tag == 1 && buttonIndex == 0) {
		[self abandonGame];
	}
}

#pragma mark -
#pragma mark DCircularProgressView

- (void) progressViewChange
{
	if ([_progressTimer isValid]) {
		_progressViewRight.progress = _progressViewRight.progress + 0.01f;
	}
	if ([_progressTimer isValid] && _progressViewRight.progress == 1.0f) {
		[self stopProgressViewAnimation];
	}
}


- (void) startProgressViewAnimation
{
	[_progressViewRight setProgress:0.0f animated:YES];
    _progressTimer = [NSTimer scheduledTimerWithTimeInterval:0.027 target:self
													selector:@selector(progressViewChange) userInfo:nil repeats:YES];
}

- (void) stopProgressViewAnimation
{
    [_progressTimer invalidate];
	_progressTimer = nil;
}

@end

