//
//  SettingsViewController.m
//  BirdGame
//
//  Created by iOSdev on 1/3/14.
//  Copyright (c) 2014 Apportable. All rights reserved.
//

#import "SettingsViewController.h"
#import "StorageManager.h"
#import "MessagingManager.h"

#define kKEYBOARD_OFFSET 15.0

@interface SettingsViewController ()

@end

@implementation SettingsViewController

- (id)initWithNibName:(NSString *)nibNameOrNil bundle:(NSBundle *)nibBundleOrNil
{
    self = [super initWithNibName:nibNameOrNil bundle:nibBundleOrNil];
    if (self) {
        // Custom initialization
    }
    return self;
}

- (void)didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}


#pragma mark -
#pragma View Lifecycle

- (void)viewDidLoad
{
    [super viewDidLoad];
    // Do any additional setup after loading the view from its nib.
	
	_backgroundView.layer.borderColor = [UIColor colorWithWhite:0.175 alpha:1.0].CGColor;
	
	_contentView.backgroundColor = [UIColor colorWithRed:255.0/255.0 green:100.0/255.0 blue:0/255.0 alpha:1.0];
	_contentView.layer.borderColor = [UIColor colorWithWhite:0.175 alpha:1.0].CGColor;
	_contentView.layer.cornerRadius = 5.0;
	_contentView.layer.borderWidth = 2.0;
	
	_genGameIDBtt.layer.borderWidth = 1.0;
	_genGameIDBtt.layer.borderColor = [UIColor colorWithRed:20.0/255 green:100.0/255 blue:220.0/255 alpha:1.0].CGColor;
	_genGameIDBtt.layer.backgroundColor = [UIColor colorWithRed:165.0/255 green:200.0/255 blue:240.0/255 alpha:1.0].CGColor;
	_genGameIDBtt.layer.cornerRadius = 8.0;
	
	_kickOpponentBtt.layer.borderWidth = 1.0;
	_kickOpponentBtt.layer.borderColor = [UIColor colorWithRed:20.0/255 green:100.0/255 blue:220.0/255 alpha:1.0].CGColor;
	_kickOpponentBtt.layer.backgroundColor = [UIColor colorWithRed:165.0/255 green:200.0/255 blue:240.0/255 alpha:1.0].CGColor;
	_kickOpponentBtt.layer.cornerRadius = 8.0;
	
	_nickNameTextField.delegate = self;
	
	NSString *nickName = [[StorageManager sharedManager] myNickName];
	if (nickName && [nickName length] > 0) {
		_nickNameTextField.text = nickName;
	}
	
	_gameIDLabel.text = [[StorageManager sharedManager] myGameID];
}


- (void)viewDidAppear:(BOOL)animated
{
    [super viewDidAppear:animated];
	[self registerForKeyboardNotifications];
	
	_activityIndicator = [[UIActivityIndicatorView alloc] initWithActivityIndicatorStyle:UIActivityIndicatorViewStyleWhiteLarge];
	
	CGSize actSize = _activityIndicator.frame.size;
	_activityIndicator.frame =
	CGRectMake(_contentView.frame.size.width/2 - actSize.width/2, _contentView.frame.size.height/2 + actSize.height/2, actSize.width, actSize.height);
	
	_activityIndicator.color = [UIColor colorWithWhite:0.85 alpha:1.0];
	_activityIndicator.hidesWhenStopped = YES;
	[_contentView addSubview:_activityIndicator];
}

- (void) viewWillDisappear:(BOOL)animated {
	[super viewWillDisappear:animated];
	[self unregisterForKeyboardNotifications];
}



#pragma mark -
#pragma Actions

- (IBAction) genGameID:(id)sender {
	
	[_activityIndicator startAnimating];
	_gameIDLabel.text = @"";
	_genGameIDBtt.enabled = NO;
	_kickOpponentBtt.enabled = NO;
	
	[[StorageManager sharedManager] generateGameID:^(BOOL finished) {
		// if completion block defined, call it
		if (finished) {
			
			[[NSNotificationCenter defaultCenter] postNotificationName:@"myGameID" object:nil];
			_gameIDLabel.text = [[StorageManager sharedManager] myGameID];
			[_activityIndicator stopAnimating];
			_genGameIDBtt.enabled = YES;
			_kickOpponentBtt.enabled = YES;
		}
	}];
}


- (IBAction) kickOpponent:(id)sender {
	
	NSString *myGameID = [[StorageManager sharedManager] myGameID];
	[[StorageManager sharedManager] setGameIdOpponent:myGameID OnTable:NO];
	[[MessagingManager sharedManager] sendMessage:@"KICKOUT" ToChannel:myGameID];
	
	_kickOpponentBtt.enabled = NO;
	[_kickOpponentBtt setTitle:@"Opponent Kicked!" forState:UIControlStateNormal];
}



#pragma mark -
#pragma mark UITextFieldDelegate

/*
- (BOOL)textFieldShouldBeginEditing:(UITextField *)textField {
	return YES;
}

- (BOOL)textFieldShouldEndEditing:(UITextField *)textField {
	return YES;
}
*/

- (void)textFieldDidEndEditing:(UITextField *)textField{
	
	if ([_nickNameTextField.text length] <= 0) {
		
		UIAlertView *alert = [[UIAlertView alloc] initWithTitle:nil message:@"Please, set a valid NickName" delegate:nil cancelButtonTitle:@"OK" otherButtonTitles:nil];
		[alert show];
	}
	else {
		[[StorageManager sharedManager] setMyNickName:_nickNameTextField.text];
	}
}

- (BOOL)textFieldShouldReturn:(UITextField *)textField
{
	if ([_nickNameTextField.text length] > 0) {
		[textField resignFirstResponder];
		return YES;
	}
	else {
		
		UIAlertView *alert = [[UIAlertView alloc] initWithTitle:nil message:@"Please, set a valid NickName" delegate:nil cancelButtonTitle:@"OK" otherButtonTitles:nil];
		[alert show];
		
		return NO;
	}
}

- (BOOL)textField:(UITextField *) textField shouldChangeCharactersInRange:(NSRange)range replacementString:(NSString *)string {
	
    NSUInteger newLength = [textField.text length] - range.length + [string length];
	BOOL returnKey = [string rangeOfString: @"\n"].location != NSNotFound;
	
	if (newLength <= 14) {
		return YES;
	}
	else {
		return returnKey;
	}
}


#pragma mark -
#pragma mark Keyboard Control

- (void) registerForKeyboardNotifications
{
	// register for keyboard notifications
	[[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(keyboardWillShow:)
												 name:UIKeyboardWillShowNotification object:nil];
	// register for keyboard notifications
	[[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(keyboardWillHide:)
												 name:UIKeyboardWillHideNotification object:nil];
    _keyboardIsShown = NO;
	
}

- (void) unregisterForKeyboardNotifications {
	
	// unregister for keyboard notifications while not visible.
    [[NSNotificationCenter defaultCenter] removeObserver:self name:UIKeyboardWillShowNotification object:nil];
	
    // unregister for keyboard notifications while not visible.
    [[NSNotificationCenter defaultCenter] removeObserver:self name:UIKeyboardWillHideNotification object:nil];
}


- (void) keyboardWillHide:(NSNotification *) notification
{
	[UIView animateWithDuration:0.20 animations:^{
		_contentView.transform = CGAffineTransformMakeTranslation(0, 0);
	} completion:^(BOOL finished) {
		_keyboardIsShown = NO;
	}];
}


- (void) keyboardWillShow:(NSNotification *) notification
{
	if (_keyboardIsShown) {
        return;
    }
	_keyboardIsShown = YES;
	[UIView animateWithDuration:0.25 animations:^{
		_contentView.transform = CGAffineTransformMakeTranslation(0, -kKEYBOARD_OFFSET);
	} completion:nil];
}


@end
