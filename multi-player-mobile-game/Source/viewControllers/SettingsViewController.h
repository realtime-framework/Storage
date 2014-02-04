//
//  SettingsViewController.h
//  BirdGame
//
//  Created by iOSdev on 1/3/14.
//  Copyright (c) 2014 Apportable. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface SettingsViewController : UIViewController <UITextFieldDelegate>


@property (weak, nonatomic) IBOutlet UIButton *closeBtt;
@property (weak, nonatomic) IBOutlet UIView *backgroundView;
@property (weak, nonatomic) IBOutlet UIView *contentView;

@property (weak, nonatomic) IBOutlet UITextField *nickNameTextField;
@property (weak, nonatomic) IBOutlet UIButton *genGameIDBtt;

@property (weak, nonatomic) IBOutlet UILabel *gameIDLabel;
@property (weak, nonatomic) IBOutlet UIButton *kickOpponentBtt;

@property (strong, nonatomic) UIActivityIndicatorView *activityIndicator;

@property (readwrite, nonatomic) BOOL keyboardIsShown;


- (IBAction) genGameID:(id)sender;
- (IBAction) kickOpponent:(id)sender;


@end
