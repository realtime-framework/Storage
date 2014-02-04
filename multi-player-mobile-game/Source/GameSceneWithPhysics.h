//
//  GameSceneWithPhysics.h
//  BirdGame
//
//  Created by iOSdev on 12/30/13.
//  Copyright (c) 2013 Apportable. All rights reserved.
//

#import "CCNode.h"
#import "GameScene.h"

@interface GameSceneWithPhysics : GameScene
{
	CCNode *_physicsNode;
	CCNode *_launcherLeft;
	CCNode *_launcherRight;
	CCButton *_leftBtt;
	CCButton *_rightBtt;
	CCLabelTTF *_statusLabel;
	CCSprite *_block;
	
	CCNode *_ball_left;
	CCNode *_ball_right;
}

@property (readwrite, nonatomic) CGPoint blockInitialPosition;
@property (readwrite, nonatomic) float timer;
@property (nonatomic, retain) DACircularProgressView *progressViewLeft;
@property (nonatomic, retain) NSTimer *waitingTimer;
@property (nonatomic, retain) NSTimer *progressTimer;


- (void) receivedMSG:(NSString *) message onChannel:(NSString *) channel;

@end
