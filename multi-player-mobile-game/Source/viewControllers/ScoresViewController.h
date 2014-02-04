//
//  ScoresViewController.h
//  BirdGame
//
//  Created by iOSdev on 1/6/14.
//  Copyright (c) 2014 Apportable. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface ScoresViewController : UIViewController


@property (weak, nonatomic) IBOutlet UIView *backgroundView;
@property (weak, nonatomic) IBOutlet UIView *scrollContentView;
@property (weak, nonatomic) IBOutlet UIScrollView *scrollView;
@property (weak, nonatomic) IBOutlet UIButton *closeBtt;
@property (weak, nonatomic) IBOutlet UISegmentedControl *scoresControl;
@property (strong, nonatomic) UIActivityIndicatorView *activityIndicator;

@property (retain, nonatomic) NSMutableArray *scores;


- (IBAction) switchScoreBoard:(id)sender;


@end
