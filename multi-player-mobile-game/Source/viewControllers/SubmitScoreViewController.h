//
//  SubmitScoreViewController.h
//  BirdGame
//
//  Created by iOSdev on 1/7/14.
//  Copyright (c) 2014 Apportable. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface SubmitScoreViewController : UIViewController <UITextFieldDelegate>



@property (weak, nonatomic) IBOutlet UIView *backgroundView;
@property (weak, nonatomic) IBOutlet UIButton *closeBtt;
@property (weak, nonatomic) IBOutlet UIScrollView *scrollView;
@property (weak, nonatomic) IBOutlet UILabel *scoreLabel;
@property (weak, nonatomic) IBOutlet UITextField *nickNameTextField;
@property (readwrite, nonatomic) BOOL keyboardIsShown;
@property (readwrite, nonatomic) int score;

@property (weak, nonatomic) IBOutlet UIButton *submitBtt;
@property (weak, nonatomic) IBOutlet UIButton *skipBtt;


- (IBAction) submitScore:(id)sender;


@end
