//
//  GameSceneWithPhysics.m
//  BirdGame
//
//  Created by iOSdev on 12/30/13.
//  Copyright (c) 2013 Apportable. All rights reserved.
//

#import "GameSceneWithPhysics.h"

@implementation GameSceneWithPhysics


- (void) onEnter {
	
	[super onEnter];
	[[CCDirector sharedDirector] pause];
	
	super.gameStatus = kGamePaused;
}

- (void) onEnterTransitionDidFinish {
	
	[super onEnterTransitionDidFinish];

	_leftBtt.userInteractionEnabled = NO;
	_rightBtt.userInteractionEnabled = NO;
	
	_statusLabel = [CCLabelTTF labelWithString:@"Waiting for opponent" fontName:@"HelveticaNeue-Bold" fontSize:32];
	_statusLabel.color = ccORANGE;
	_statusLabel.position = ccp (240,240);
	_statusLabel.shadowOffset = ccp (1,-1);
	_statusLabel.shadowColor = ccc4(25, 25, 25, 150);
	_statusLabel.shadowBlurRadius = 2.0;
	[self addChild:_statusLabel];
	
	_blockInitialPosition = _block.position;
	
	[[StorageManager sharedManager] checkGameIdOpponent:[[StorageManager sharedManager] gameID] OnTableOnCompletion:^(BOOL completion) {
		// if completion block defined, call it
		if (completion) {
			[super sendMessage:[NSString stringWithFormat:@"ARUTHERE_%@", LEFT_SIDE]];
			_waitingTimer = [NSTimer scheduledTimerWithTimeInterval:60.0 target:self
														   selector:@selector(cancelGame) userInfo:nil repeats:NO];
		}
	}];
}

- (void) onExitTransitionDidStart {
	
	[super onExitTransitionDidStart];
	[_waitingTimer invalidate];
	_waitingTimer = nil;
}


- (void) backAction {
	
	if (super.gameStatus == kGameRunning) {
		NSString *message = [NSString stringWithFormat:@"GMOV_%@_%d", RIGHT_SIDE, [super calcScoreForTimeElapsed:_timer]];
		[super sendMessage:message];
	}
	[self abandonGame];
}

- (void) abandonGame {
	
	[self unschedule:@selector(sendPosition:)];
	[_progressViewLeft removeFromSuperview];
	super.gameStatus = kGameNotInitiated;
	[[CCDirector sharedDirector] replaceScene:[CCBReader sceneWithNodeGraphFromFile:@"MainScene"]];
}


- (void) setScene {
	
	NSLog(@"SET SCENE");
	[super setShootLeft:0];
	[super setShootRight:0];
	
	_leftBtt.userInteractionEnabled = YES;
	
	[_block setRotation:0];
	[_block setPosition:ccp(_blockInitialPosition.x, _blockInitialPosition.y)];
	
	[_statusLabel removeFromParent];
	[[CCDirector sharedDirector] resume];
	
	super.gameStatus = kGameRunning;
	
	_progressViewLeft = [[DACircularProgressView alloc] initWithFrame:CGRectMake(35, 270, 20.0, 20.0)];
    _progressViewLeft.roundedCorners = YES;
	_progressViewLeft.alpha = 0.50;
    _progressViewLeft.trackTintColor = [UIColor colorWithWhite:1.0 alpha:0.75];
	_progressViewLeft.progressTintColor = [UIColor redColor];
	_progressViewLeft.progress = 1.0;

	[[[CCDirector sharedDirector] view] addSubview:_progressViewLeft];
	
	[self schedule:@selector(sendPosition:) interval:0.05 repeat:kCCRepeatForever delay:0.0];
}


- (void) launchBird:(id) sender
{
	// calc Rotation
	float rotationRadians = 0;
	
	rotationRadians = CC_DEGREES_TO_RADIANS(_launcherLeft.rotation);
	
	NSString *message = [NSString stringWithFormat:@"SHOOT_%@_%d_%f", LEFT_SIDE, [super shootLeft], rotationRadians];
	[super sendMessage:message];

	_leftBtt.userInteractionEnabled = NO;
}


- (void) player:(NSString *)side DidShoot:(int) shoot WithAngle:(float) angle {
	
	CGPoint dirVector = ccp(sinf(angle), cosf(angle));
	CGPoint ballOffset = ccpMult(dirVector, 40);
	
	if ([side isEqualToString:LEFT_SIDE]) {
		
		[super setShootLeft:shoot + 1];
		
		_ball_left = [CCBReader nodeGraphFromFile:@"Bird"];
		_ball_left.scale = 0.50;
		_ball_left.position = ccpAdd(_launcherLeft.position, ballOffset);
		
		//add ball to psysics node
		[_physicsNode addChild:_ball_left];
		[_ball_left performSelector:@selector(removeFromParent) withObject:nil afterDelay:2.25];
		
		// impulse
		CGPoint force = ccpMult(dirVector, 17500);
		[_ball_left.physicsBody applyForce:force];
		
		[self scheduleOnce:@selector(enableLeftBtt:) delay:2.25];
		if ([_progressTimer isValid]) {
			[self stopProgressViewAnimation];
			[self startProgressViewAnimation];
		}
		else {
			[self startProgressViewAnimation];
		}
	}
	else if ([side isEqualToString:RIGHT_SIDE]) {
		
		[super setShootRight:shoot + 1];
		
		_ball_right = [CCBReader nodeGraphFromFile:@"Bird"];
		_ball_right.scale = 0.50;
		_ball_right.position = ccpAdd(_launcherRight.position, ballOffset);
		
		//add ball to psysics node
		[_physicsNode addChild:_ball_right];
		[_ball_right performSelector:@selector(removeFromParent) withObject:nil afterDelay:2.25];
		
		// impulse
		CGPoint force = ccpMult(dirVector, 17500);
		[_ball_right.physicsBody applyForce:force];
	}
}


- (void)enableLeftBtt:(CCTime) delta {
	[self unschedule:@selector(enableLeftBtt:)];
	_leftBtt.userInteractionEnabled = YES;
}

- (void) update:(CCTime)delta {
	
	[self checkBlockPosition];
	
	if (super.gameStatus == kGameRunning) {
		if (fabsf (sinf(CC_DEGREES_TO_RADIANS(_block.rotation))) > 0.997 || fabsf(cosf(CC_DEGREES_TO_RADIANS(_block.rotation))) > 0.98) {
			[self detectCollision];
		}
	}
}


- (void) detectCollision {
	
	if (CGRectIntersectsRect(_leftBtt.boundingBox, _block.boundingBox))
	{
		//NSLog(@"Collision detected - Left RIGHT WINS - %f", _block.rotation);
		[self unschedule:@selector(sendPosition:)];
		NSString *message = [NSString stringWithFormat:@"GMOV_%@_%d", RIGHT_SIDE, [super calcScoreForTimeElapsed:_timer]];
		[super sendMessage:message];
	}
	if (CGRectIntersectsRect(_rightBtt.boundingBox, _block.boundingBox))
	{
		//NSLog(@"Collision detected on right LEFT WINS - %f", _block.rotation);
		[self unschedule:@selector(sendPosition:)];
		NSString *message = [NSString stringWithFormat:@"GMOV_%@_%d", LEFT_SIDE, [super calcScoreForTimeElapsed:_timer]];
		[super sendMessage:message];
	}
}

- (void) checkBlockPosition {
	if (!CGRectIntersectsRect(_physicsNode.boundingBox, _block.boundingBox)) {
		
		[_block setRotation:0];
		[_block setPosition:ccp(_blockInitialPosition.x, _blockInitialPosition.y)];
	}
}


- (void) gameOverWithWinner:(NSString *) winner AndScore:(int) score {
	
	NSLog(@"GAME OVER SIDE: %@", winner);
	
	[self unschedule:@selector(sendPosition:)];
	[[CCDirector sharedDirector] pause];
	super.gameStatus = kGamePaused;
	[_progressViewLeft removeFromSuperview];
	
	NSString *msg = nil;
	ccColor3B msgColor = ccGRAY;
	if ([winner isEqualToString:LEFT_SIDE]) {
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

- (void) sendPosition:(CCTime) deltaTime {
	
	_timer = _timer + deltaTime;
	_timerLabel.string = [NSString stringWithFormat:@"TIME: %.1f", _timer];
	
	NSString *message = [NSString stringWithFormat:@"POS_B|%f|%f|%f_LB|%d|%f|%f|%f_RB|%d|%f|%f|%f_%f",
						 _block.position.x, _block.position.y, _block.rotation,
						 [super shootLeft], _ball_left.position.x, _ball_left.position.y, _ball_left.rotation,
						 [super shootRight], _ball_right.position.x, _ball_right.position.y, _ball_right.rotation,
						 _timer];
	
	[super sendMessage:message];
}

- (void) restartGame {
	
	_restartBtt.userInteractionEnabled = NO;
	if (super.gameStatus == kGamePaused) {
		[super sendMessage:@"RESTART"];
	}
}


#pragma mark -
#pragma mark MessagingDelegate
- (void) receivedMSG:(NSString *) message onChannel:(NSString *) channel {
	
	//NSLog(@"MSG YES PH: %@\n\n", message);
	if (super.gameStatus == kGameRunning) {
		
		NSArray *messageChunks = [message componentsSeparatedByString:@"_"];
		
		if ([messageChunks count] > 1) {
			
			if ([[messageChunks objectAtIndex:0] isEqualToString:@"SHOOT"]) {
				
				NSString *playerSide = [messageChunks objectAtIndex:1];
				int shoot = [[messageChunks objectAtIndex:2] intValue];
				NSString *angle = [messageChunks objectAtIndex:3];
				
				[self player:playerSide DidShoot:shoot WithAngle:[angle floatValue]];
			}
			else if ([[messageChunks objectAtIndex:0] isEqualToString:@"GMOV"]) {
				
				NSString *playerSide = [messageChunks objectAtIndex:1];
				[self gameOverWithWinner:playerSide AndScore:[[messageChunks objectAtIndex:2] intValue]];
			}
			else if ([[messageChunks objectAtIndex:0] isEqualToString:@"PAUSE"] && [[messageChunks objectAtIndex:1] isEqualToString:RIGHT_SIDE]) {

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
					
					if ([[messageChunks objectAtIndex:0] isEqualToString:@"ARUTHERE"] && [[messageChunks objectAtIndex:1] isEqualToString:RIGHT_SIDE]) {
						
						[super sendMessage:[NSString stringWithFormat:@"IMHERE_%@", LEFT_SIDE]];
						
					}
					else if ([[messageChunks objectAtIndex:0] isEqualToString:@"IMHERE"] && [[messageChunks objectAtIndex:1] isEqualToString:RIGHT_SIDE]) {
						
						[super sendMessage:@"STARTGAME"];
					}
				}
			}
		}
		if ([message isEqualToString:@"JOINRESTART"]) {
			
			UIAlertView *alert = [[UIAlertView alloc] initWithTitle:nil message:@"Opponent Wants to Restart Game. Do You??" delegate:self cancelButtonTitle:@"No" otherButtonTitles:@"Yes", nil];
			alert.tag = 0;
			[alert show];
		}
		else if ([message isEqualToString:@"OKRESTART"]) {
			[[CCDirector sharedDirector] replaceScene:[CCBReader sceneWithNodeGraphFromFile:@"GameSceneWithPhysics"]];
		}
		else if ([message isEqualToString:@"NORESTART"]) {
			
			UIAlertView *alert = [[UIAlertView alloc] initWithTitle:nil message:@"Opponent Rejected Restart Game" delegate:self cancelButtonTitle:@"Ok" otherButtonTitles:nil];
			alert.tag = 1;
			[alert show];
		}
	}
}



- (void) cancelGame {
	
	if (super.gameStatus != kGameRunning) {
		NSString *myGameID = [[StorageManager sharedManager] myGameID];
		[[StorageManager sharedManager] setGameIdOpponent:myGameID OnTable:NO];
		[[MessagingManager sharedManager] sendMessage:@"KICKOUT" ToChannel:myGameID];
		
		UIAlertView *alert = [[UIAlertView alloc] initWithTitle:nil message:@"Opponent is not Available to play!" delegate:nil cancelButtonTitle:@"Ok" otherButtonTitles:nil];
		alert.tag = 1;
		[alert show];
	}
}


- (void) applicationNotification:(NSNotification *)notification {
	
	if ([[notification name] isEqual:@"applicationWillResignActive"]) {
		super.gameStatus = kGamePaused;
		[self sendMessage:[NSString stringWithFormat:@"PAUSE_%@", LEFT_SIDE]];
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
		_progressViewLeft.progress = _progressViewLeft.progress + 0.01f;
	}
	if ([_progressTimer isValid] && _progressViewLeft.progress == 1.0f) {
		[self stopProgressViewAnimation];
	}
}


- (void) startProgressViewAnimation
{
	[_progressViewLeft setProgress:0.0f animated:YES];
    _progressTimer = [NSTimer scheduledTimerWithTimeInterval:0.027 target:self
													selector:@selector(progressViewChange) userInfo:nil repeats:YES];
}

- (void) stopProgressViewAnimation
{
    [_progressTimer invalidate];
	_progressTimer = nil;
}

@end
