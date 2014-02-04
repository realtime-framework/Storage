//
//  GameSceneNoPhysics.h
//  BirdGame
//
//  Created by iOSdev on 12/30/13.
//  Copyright (c) 2013 Apportable. All rights reserved.
//

#import "CCNode.h"
#import "GameScene.h"


@interface GameSceneNoPhysics : GameScene
{
	CCButton *_rightBtt;
	CCNode *_launcherLeft;
	CCNode *_launcherRight;
	CCSprite *_block;
	
	CCNode *_ball_left;
	CCNode *_ball_right;
	
	CCLabelTTF *_statusLabel;
}

@property (nonatomic, retain) DACircularProgressView *progressViewRight;
@property (nonatomic, retain) NSTimer *waitingTimer;
@property (strong, nonatomic) NSTimer *progressTimer;


- (void) receivedMSG:(NSString *) message onChannel:(NSString *) channel;

@end
