//
//  MainScene.h
//  PROJECTNAME
//
//  Created by Viktor on 10/10/13.
//  Copyright (c) 2013 Apportable. All rights reserved.
//

#import "CCNode.h"
#import "CCTextField.h"
#import "GameScene.h"



@interface MainScene : CCNode <UITextFieldDelegate>
{
	CCButton *_startGameBtt;
	CCButton *_joinGameBtt;
	CCLabelTTF *_startGameLabel;
	CCLabelTTF *_challengeLabel;
	CCTextField *_joinGameTextField;
	UIActivityIndicatorView *activityIndicator;
}

- (void) showInfo:(id)sender;
- (void) showHighScores:(id)sender;
- (void) settings:(id)sender;


@end
