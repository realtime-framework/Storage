//
//  MainScene.m
//  PROJECTNAME
//
//  Created by Viktor on 10/10/13.
//  Copyright (c) 2013 Apportable. All rights reserved.
//

#import "MainScene.h"
#import "AppDelegate.h"
#import "StorageManager.h"
#import "MessagingManager.h"
#import "InfoViewController.h"
#import "ScoresViewController.h"
#import "SettingsViewController.h"

@implementation MainScene


- (void) onEnterTransitionDidFinish {
	
	[super onEnterTransitionDidFinish];
	
	[[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(mySettingsSetUp:) name:@"myGameID" object:nil];
	[[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(mySettingsSetUp:) name:@"gameHasOpponent" object:nil];
	[[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(applicationNotification:) name:@"applicationDidBecomeActive" object:nil];

	
	_startGameBtt.userInteractionEnabled = NO;
	_joinGameBtt.userInteractionEnabled = NO;
	_joinGameTextField.userInteractionEnabled = NO;
	[_challengeLabel setVisible:NO];
	
	_joinGameTextField.textField.delegate = self;
	[_joinGameTextField.textField setFont:[UIFont fontWithName:@"HelveticaNeue" size:14]];
	
	if (![[[StorageManager sharedManager] gameID] isEqualToString:[[StorageManager sharedManager] myGameID]]) {
		_joinGameTextField.textField.text = [[StorageManager sharedManager] gameID];
	}
	else {
		_joinGameTextField.textField.text = @"";
	}
	
	if ([[[StorageManager sharedManager] myGameID] length] < 4) {
		
		activityIndicator = [[UIActivityIndicatorView alloc] initWithActivityIndicatorStyle:UIActivityIndicatorViewStyleWhiteLarge];
		activityIndicator.frame = CGRectMake([[CCDirector sharedDirector] view].center.x, [[CCDirector sharedDirector] view].center.y, activityIndicator.frame.size.width, activityIndicator.frame.size.height);
		
		activityIndicator.color = [UIColor colorWithRed:(float)255.0/255.0 green:(float)95.0/255.0 blue:0 alpha:1.0];
		activityIndicator.hidesWhenStopped = YES;
		[activityIndicator startAnimating];
		[[[CCDirector sharedDirector] view] addSubview:activityIndicator];
	}
	else {
		_startGameLabel.string = [NSString stringWithFormat:@"Start Game\nID = %@", [[StorageManager sharedManager] myGameID]];
		
		// This will start Messaging Client, call init method and subscribe to My Game ID
		[MessagingManager sharedManager];
		
		_startGameBtt.userInteractionEnabled = YES;
		_joinGameBtt.userInteractionEnabled = YES;
		_joinGameTextField.userInteractionEnabled = YES;
	}
	
	if ([[StorageManager sharedManager] kickOut]) {
		
		UIAlertView *alertView = [[UIAlertView alloc] initWithTitle:nil message:@"You were Kicked Out by Game Id Owner" delegate:nil cancelButtonTitle:@"Ok" otherButtonTitles:nil];
		[alertView show];
		
		[[StorageManager sharedManager] setKickOut:NO];
	}
}

- (void) onExit {
	[super onExit];
	
	[activityIndicator stopAnimating];
	[activityIndicator removeFromSuperview];
	[[NSNotificationCenter defaultCenter] removeObserver:self];
}


- (void) startGame
{
	[[StorageManager sharedManager] setGameID:[[StorageManager sharedManager] myGameID]];
	[[CCDirector sharedDirector] replaceScene:[CCBReader sceneWithNodeGraphFromFile:@"GameSceneWithPhysics"]];
}



- (void) joinGame {
	
	_joinGameBtt.userInteractionEnabled = NO;
	
	if ([_joinGameTextField.textField.text length] < 4) {
		
		UIAlertView *alertView = [[UIAlertView alloc] initWithTitle:nil message:@"Game ID Doesn't exists" delegate:nil cancelButtonTitle:@"Ok" otherButtonTitles:nil];
		[alertView show];
		_joinGameBtt.userInteractionEnabled = YES;
		return;
	}
	
	else if ([_joinGameTextField.textField.text isEqualToString:[[StorageManager sharedManager] myGameID]]) {
		
		UIAlertView *alertView = [[UIAlertView alloc] initWithTitle:nil message:@"That's your Game ID, try another one!" delegate:nil cancelButtonTitle:@"Ok" otherButtonTitles:nil];
		[alertView show];
		_joinGameBtt.userInteractionEnabled = YES;
		return;
	}
	else {
		[[StorageManager sharedManager] validateGameID:_joinGameTextField.textField.text onCompletion:^(BOOL completion) {
			// if completion block defined, call it
			if (completion) {
				
				[[StorageManager sharedManager] setGameID:_joinGameTextField.textField.text];
				[[StorageManager sharedManager] checkGameIdOpponent:[[StorageManager sharedManager] gameID] OnTableOnCompletion:^(BOOL completion) {
					// if completion block defined, call it
					if (completion) {
						[[StorageManager sharedManager] setGameID:@""];
						UIAlertView *alertView = [[UIAlertView alloc] initWithTitle:@"Sorry!" message:@"Player already has an opponent. Try Later" delegate:nil cancelButtonTitle:@"Ok" otherButtonTitles:nil];
						[alertView show];
						_joinGameBtt.userInteractionEnabled = YES;
					}
					else {
						
						[[CCDirector sharedDirector] replaceScene:[CCBReader sceneWithNodeGraphFromFile:@"GameSceneNoPh"]];
						[[StorageManager sharedManager] setGameIdOpponent:[[StorageManager sharedManager] gameID] OnTable:YES];
					}
				}];
			}
			else {
				UIAlertView *alertView = [[UIAlertView alloc] initWithTitle:nil message:@"Game ID Doesn't exists" delegate:nil cancelButtonTitle:@"Ok" otherButtonTitles:nil];
				[alertView show];
				_joinGameBtt.userInteractionEnabled = YES;
				return;
			}
		}];
	}
}


- (void) showInfo:(id)sender {
	
	InfoViewController *infoViewController = [[InfoViewController alloc] initWithNibName:@"InfoViewController" bundle:nil];
	infoViewController.view.frame = [[[CCDirector sharedDirector] view] frame];
	infoViewController.view.alpha = 0.0;
	
	AppController *mainDelegate = (AppController *) [[UIApplication sharedApplication] delegate];
	[mainDelegate.navController addChildViewController:infoViewController];
    [mainDelegate.navController.view addSubview:infoViewController.view];
    [infoViewController didMoveToParentViewController:mainDelegate.navController];
	
	UITapGestureRecognizer *tapGesture = [[UITapGestureRecognizer alloc] initWithTarget:self action:@selector(removeModalController:)];
	tapGesture.numberOfTapsRequired = 1;
	[infoViewController.backgroundView addGestureRecognizer:tapGesture];
	
	[infoViewController.closeBtt addTarget:self action:@selector(removeModalController:) forControlEvents:UIControlEventTouchUpInside];
	
	[UIView animateWithDuration:0.350 animations:^{
		infoViewController.view.alpha = 1.0;
	} completion:nil];
	
}


- (void) showHighScores:(id)sender {
	
	ScoresViewController *scoresViewController = [[ScoresViewController alloc] initWithNibName:@"ScoresViewController" bundle:nil];
	scoresViewController.view.frame = [[[CCDirector sharedDirector] view] frame];
	scoresViewController.view.alpha = 0.0;
	
	AppController *mainDelegate = (AppController *) [[UIApplication sharedApplication] delegate];
	[mainDelegate.navController addChildViewController:scoresViewController];
    [mainDelegate.navController.view addSubview:scoresViewController.view];
    [scoresViewController didMoveToParentViewController:mainDelegate.navController];
	
	UITapGestureRecognizer *tapGesture = [[UITapGestureRecognizer alloc] initWithTarget:self action:@selector(removeModalController:)];
	tapGesture.numberOfTapsRequired = 1;
	[scoresViewController.backgroundView addGestureRecognizer:tapGesture];
	
	[scoresViewController.closeBtt addTarget:self action:@selector(removeModalController:) forControlEvents:UIControlEventTouchUpInside];
	
	[UIView animateWithDuration:0.350 animations:^{
		scoresViewController.view.alpha = 1.0;
	} completion:nil];
}



- (void) settings:(id)sender {
	
	SettingsViewController *setViewController = [[SettingsViewController alloc] initWithNibName:@"SettingsViewController" bundle:nil];
	setViewController.view.frame = [[[CCDirector sharedDirector] view] frame];
	setViewController.view.alpha = 0.0;
	
	AppController *mainDelegate = (AppController *) [[UIApplication sharedApplication] delegate];
	[mainDelegate.navController addChildViewController:setViewController];
    [mainDelegate.navController.view addSubview:setViewController.view];
    [setViewController didMoveToParentViewController:mainDelegate.navController];
	
	UITapGestureRecognizer *tapGesture = [[UITapGestureRecognizer alloc] initWithTarget:self action:@selector(removeModalController:)];
	tapGesture.numberOfTapsRequired = 1;
	[setViewController.backgroundView addGestureRecognizer:tapGesture];
	
	[setViewController.closeBtt addTarget:self action:@selector(removeModalController:) forControlEvents:UIControlEventTouchUpInside];
	
	[UIView animateWithDuration:0.350 animations:^{
		setViewController.view.alpha = 1.0;
	} completion:nil];
}



- (void) removeModalController:(id) sender {
	
	__block id senderNextResponder = nil;
	if ([sender isKindOfClass:[UIGestureRecognizer class]]) {
		sender = [sender view];
	}
	for (UIResponder *aNextResponder = [sender nextResponder]; aNextResponder; aNextResponder = aNextResponder.nextResponder)
	{
		if ([aNextResponder isKindOfClass:[InfoViewController class]] || [aNextResponder isKindOfClass:[ScoresViewController class]] || [aNextResponder isKindOfClass:[SettingsViewController class]]) {
			senderNextResponder =  (UIViewController *)aNextResponder;
			break;
		}
	}
	
	if (senderNextResponder) {
		[UIView animateWithDuration:0.20 animations:^{
			[senderNextResponder view].alpha = 0.0;
		} completion:^(BOOL finished) {
			
			AppController *mainDelegate = (AppController *) [[UIApplication sharedApplication] delegate];
			[senderNextResponder willMoveToParentViewController:mainDelegate.navController];
			[[senderNextResponder view] removeFromSuperview];
			[senderNextResponder removeFromParentViewController];
			senderNextResponder = nil;
		}];
	}
}


#pragma mark -
#pragma mark UITextFieldDelegate

- (void) endEditing:(id) sender {
	NSLog(@"TEXTFIELD: %@", _joinGameTextField.textField.text);
}

- (BOOL)textFieldShouldBeginEditing:(UITextField *)textField{

    textField.backgroundColor = [UIColor colorWithRed:220.0f/255.0f green:220.0f/255.0f blue:220.0f/255.0f alpha:1.0f];
    return YES;
}
- (void)textFieldDidBeginEditing:(UITextField *)textField{
	
	if (_joinGameTextField.keyboardIsShown)
    {
		[_joinGameTextField performSelector:@selector(focusOnTextField) withObject:nil];
    }
}

- (BOOL)textFieldShouldEndEditing:(UITextField *)textField{
    textField.backgroundColor = [UIColor whiteColor];
    return YES;
}

- (void)textFieldDidEndEditing:(UITextField *)textField{
	[_joinGameTextField performSelector:@selector(endFocusingOnTextField) withObject:nil];
}

- (BOOL)textFieldShouldReturn:(UITextField *)textField
{
    [textField resignFirstResponder];
    [_joinGameTextField performSelector:@selector(triggerAction) withObject:nil];
    return YES;
}

- (BOOL)textField:(UITextField *) textField shouldChangeCharactersInRange:(NSRange)range replacementString:(NSString *)string {
	
    NSUInteger newLength = [textField.text length] - range.length + [string length];
	BOOL returnKey = [string rangeOfString: @"\n"].location != NSNotFound;
	
	if (newLength <= 4) {
		return YES;
	}
	else {
		return returnKey;
	}
}


- (void) mySettingsSetUp:(NSNotification *)notification {
	
	if ([[notification name] isEqual:@"myGameID"]) {
		
		[activityIndicator stopAnimating];
		[activityIndicator removeFromSuperview];
		
		_startGameLabel.string = [NSString stringWithFormat:@"Start Game\nID = %@", [[StorageManager sharedManager] myGameID]];
		_startGameBtt.userInteractionEnabled = YES;
		_joinGameBtt.userInteractionEnabled = YES;
		_joinGameTextField.userInteractionEnabled = YES;
		
		// This will start Messaging Client, call init method and subscribe to My Game ID
		[MessagingManager sharedManager];
	}
	else if ([[notification name] isEqual:@"gameHasOpponent"]) {
		
		[_challengeLabel setVisible:[[[notification userInfo] objectForKey:KEY_BIRDGAME_OPPONENT] boolValue]];
	}
}


- (void) applicationNotification:(NSNotification *)notification {
	
	if ([[notification name] isEqual:@"applicationDidBecomeActive"]) {
		[[CCDirector sharedDirector] resume];
		[[StorageManager sharedManager] checkGameIdOpponent:[[StorageManager sharedManager] myGameID] OnTableOnCompletion:^(BOOL completion) {
			// if completion block defined, call it
			if (completion) {
				[_challengeLabel setVisible:YES];
			}
		}];
	}
}

@end
