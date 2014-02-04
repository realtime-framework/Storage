//
//  SubmitScoreViewController.m
//  BirdGame
//
//  Created by iOSdev on 1/7/14.
//  Copyright (c) 2014 Apportable. All rights reserved.
//

#define kKEYBOARD_OFFSET 68.0

#import "SubmitScoreViewController.h"
#import "StorageManager.h"


@interface SubmitScoreViewController ()

@end

@implementation SubmitScoreViewController

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
	
	_scrollView.backgroundColor = [UIColor colorWithRed:255.0/255.0 green:100.0/255.0 blue:0/255.0 alpha:1.0];
	_scrollView.layer.borderColor = [UIColor colorWithWhite:0.175 alpha:1.0].CGColor;
	_scrollView.layer.cornerRadius = 5.0;
	_scrollView.layer.borderWidth = 2.0;
	
	_scoreLabel.text = [NSString stringWithFormat:@"%d", _score];
	
	
	_skipBtt.layer.borderWidth = 1.0;
	_skipBtt.layer.borderColor = [UIColor colorWithRed:20.0/255 green:100.0/255 blue:220.0/255 alpha:1.0].CGColor;
	_skipBtt.layer.backgroundColor = [UIColor colorWithRed:190.0/255 green:215.0/255 blue:250.0/255 alpha:1.0].CGColor;
	_skipBtt.layer.cornerRadius = 8.0;
	
	_submitBtt.layer.borderWidth = 1.0;
	_submitBtt.layer.borderColor = [UIColor colorWithRed:20.0/255 green:100.0/255 blue:220.0/255 alpha:1.0].CGColor;
	_submitBtt.layer.backgroundColor = [UIColor colorWithRed:165.0/255 green:200.0/255 blue:240.0/255 alpha:1.0].CGColor;
	_submitBtt.layer.cornerRadius = 8.0;
	
	_submitBtt.enabled = NO;
	_nickNameTextField.delegate = self;
	
	NSString *nickName = [[StorageManager sharedManager] myNickName];
	if (nickName && [nickName length] > 0) {
		_nickNameTextField.text = nickName;
		_submitBtt.enabled = YES;
	}
}

- (void)viewDidAppear:(BOOL)animated
{
    [super viewDidAppear:animated];
	[self registerForKeyboardNotifications];
}

- (void) viewWillDisappear:(BOOL)animated {

	[super viewWillDisappear:animated];
	[self unregisterForKeyboardNotifications];
}


#pragma mark -
#pragma Actions

- (IBAction) submitScore:(id)sender {
	
	__block UIActivityIndicatorView *activityView = [[UIActivityIndicatorView alloc] initWithActivityIndicatorStyle:UIActivityIndicatorViewStyleWhiteLarge];
	activityView.center = CGPointMake(_scrollView.center.x, _scrollView.center.y * 0.85);
	activityView.hidesWhenStopped = YES;
	[activityView startAnimating];
	[self.view addSubview:activityView];
	
	_submitBtt.enabled = NO;
	_nickNameTextField.enabled = NO;

	__block NSDictionary *itemDict = [[NSDictionary alloc] initWithObjectsAndKeys:
							  [[StorageManager sharedManager] gameID], PKEY_BIRDGAME,
							  [NSNumber numberWithInt:_score], SKEY_BIRDGAME,
							  _nickNameTextField.text, @"nickName", nil];
	
	TableRef *tableRef = [[[StorageManager sharedManager] storageRef] table:TAB_BIRDGAME_SCORES];
	[tableRef push:itemDict
		   success:^(ItemSnapshot *item) {//define block for a success callback
			   itemDict = nil;
			   itemDict = [[NSDictionary alloc] initWithObjectsAndKeys:
						   PKEY_GAMES_VALUE, PKEY_GAMES,
						   [NSNumber numberWithInt:_score], SKEY_GAMES,
						   [[StorageManager sharedManager] gameID], @"gameID",
						   _nickNameTextField.text, @"nickName", nil];
			   
			   TableRef *tableRef = [[[StorageManager sharedManager] storageRef] table:TAB_GAMES_SCORES];
			   [tableRef push:itemDict
					  success:^(ItemSnapshot *item) {//define block for a success callback
						  
						  [_closeBtt sendActionsForControlEvents:UIControlEventTouchUpInside];
						  [activityView stopAnimating];
						  [activityView removeFromSuperview];
					  }
						error:^(NSError* e){ //define block for an error callback
							NSLog(@"### Error: %@", [e localizedDescription]);
						}];
		   }
			 error:^(NSError* e){ //define block for an error callback
				 NSLog(@"### Error: %@", [e localizedDescription]);
			 }];
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
		_submitBtt.enabled = YES;
		if ([[[StorageManager sharedManager] myNickName] length] <= 0) {
			[[StorageManager sharedManager] setMyNickName:_nickNameTextField.text];
		}
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
		_scrollView.transform = CGAffineTransformMakeTranslation(0, 0);
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
		_scrollView.transform = CGAffineTransformMakeTranslation(0, -kKEYBOARD_OFFSET);
	} completion:nil];
}


@end
