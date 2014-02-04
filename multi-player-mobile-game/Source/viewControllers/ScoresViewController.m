//
//  ScoresViewController.m
//  BirdGame
//
//  Created by iOSdev on 1/6/14.
//  Copyright (c) 2014 Apportable. All rights reserved.
//

#import "ScoresViewController.h"
#import "StorageManager.h"

@interface ScoresViewController ()

@end

@implementation ScoresViewController

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

- (void)viewDidLoad
{
    [super viewDidLoad];
    // Do any additional setup after loading the view from its nib.
	
	_backgroundView.layer.borderColor = [UIColor colorWithWhite:0.175 alpha:1.0].CGColor;
	
	_scrollContentView.backgroundColor = [UIColor colorWithRed:255.0/255.0 green:95.0/255.0 blue:0/255.0 alpha:1.0];
	_scrollContentView.layer.borderColor = [UIColor colorWithWhite:0.175 alpha:1.0].CGColor;
	_scrollContentView.layer.cornerRadius = 5.0;
	_scrollContentView.layer.borderWidth = 2.0;
	
	_scoresControl.selectedSegmentIndex = 0;
	_scores = [[NSMutableArray alloc] init];
	
}


- (void) viewDidAppear:(BOOL)animated {
	
	[super viewDidAppear:animated];
	
	_activityIndicator = [[UIActivityIndicatorView alloc] initWithActivityIndicatorStyle:UIActivityIndicatorViewStyleWhiteLarge];
	[_activityIndicator setCenter:_scrollView.center];
	_activityIndicator.color = [UIColor colorWithWhite:0.85 alpha:1.0];
	_activityIndicator.hidesWhenStopped = YES;
	[_scrollContentView addSubview:_activityIndicator];
	
	[self getScores];
}


- (IBAction) switchScoreBoard:(id)sender {
	
	[self cleanScrollView];
	[self getScores];
}


- (void) getScores
{
	NSLog(@"GET SCORES %@", [_scoresControl titleForSegmentAtIndex: [_scoresControl selectedSegmentIndex]]);
	
	void (^cbSuccess)(ItemSnapshot*) = ^(ItemSnapshot *item) {
		
		if(item!=nil) {
			NSDictionary *dic = [item val];
			NSLog(@"Score Item: %@", dic);
			[_scores addObject:dic];
		}
		else {
			//we got all items
			[self showScores];
			
			[_activityIndicator stopAnimating];
		}
	};
	
	void (^cbError)(NSError*) = ^(NSError* e){ //define block for an error callback
		NSLog(@"### Error: %@", [e localizedDescription]);
	};
	
	[_activityIndicator startAnimating];
	
	// clear scores - remove all scores
	[_scores removeAllObjects];
	TableRef *tableRef = nil;
	
	// my Game Id highScores
	if (_scoresControl.selectedSegmentIndex == 0) {
		
		tableRef = [[[StorageManager sharedManager] storageRef] table:TAB_BIRDGAME_SCORES];
			
		[tableRef equalsString:PKEY_BIRDGAME value:[[StorageManager sharedManager] myGameID]];
		[tableRef greaterEqualNumber:SKEY_BIRDGAME value:[NSNumber numberWithInt:0]];
		[tableRef limit:10];
		[tableRef desc];
		
		[tableRef getItems:cbSuccess error:cbError];
		
	}
	// global highScores
	else if (_scoresControl.selectedSegmentIndex == 1) {
		tableRef = [[[StorageManager sharedManager] storageRef] table:TAB_GAMES_SCORES];
		[tableRef equalsString:PKEY_GAMES value:PKEY_GAMES_VALUE];
		[tableRef greaterEqualNumber:SKEY_GAMES value:[NSNumber numberWithInt:0]];
		[tableRef limit:10];
		[tableRef desc];
		[tableRef getItems:cbSuccess error:cbError];
	}
}


- (void) showScores {
	
	CGSize scrollSize =  _scrollView.frame.size;
	
	float labelHeight = 25;
	float nameLabelWidth = scrollSize.width * 0.40;
	float scoreLabelWidth = scrollSize.width * 0.20;
	
	if ([_scores count] > 0) {
		
		float yOffset = 20;
		float yMult = 35;
		
		for (int i = 0; i < [_scores count]; i ++) {
			
			if (i >= [_scores count]) {
				break;
			}
			UILabel *nickLabel = [[UILabel alloc] initWithFrame:CGRectMake(scrollSize.width * 0.20, yOffset + yMult * i, nameLabelWidth, labelHeight)];
			nickLabel.font = [UIFont fontWithName:@"HelveticaNeue-Bold" size:14];
			nickLabel.textAlignment = NSTextAlignmentLeft;
			nickLabel.text = [NSString stringWithFormat:@"%d. %@", i + 1, [[_scores objectAtIndex:i] objectForKey:@"nickName"]];
			nickLabel.backgroundColor = [UIColor clearColor];
			nickLabel.textColor = [UIColor whiteColor];
			
			// my Game Id highScores
			if (_scoresControl.selectedSegmentIndex == 0) {
				nickLabel.text = [NSString stringWithFormat:@"%d. %@", i + 1, [[_scores objectAtIndex:i] objectForKey:@"nickName"]];
			}
			// global highScores
			else if (_scoresControl.selectedSegmentIndex == 1) {
				nickLabel.text = [NSString stringWithFormat:@"%d. %@ | %@", i + 1, [[_scores objectAtIndex:i] objectForKey:@"nickName"], [[_scores objectAtIndex:i] objectForKey:@"gameID"]];
			}
			
			UILabel *textLabel = [[UILabel alloc] initWithFrame:CGRectMake(scrollSize.width * 0.60, yOffset + yMult * i, scoreLabelWidth, labelHeight)];
			textLabel.font = [UIFont fontWithName:@"HelveticaNeue-Bold" size:14];
			textLabel.textAlignment = NSTextAlignmentRight;
			textLabel.backgroundColor = [UIColor clearColor];
			textLabel.textColor = [UIColor whiteColor];
			textLabel.text = [NSString stringWithFormat:@"%@", [[_scores objectAtIndex:i] objectForKey:@"score"]];
			
			[_scrollView addSubview:textLabel];
			[_scrollView addSubview:nickLabel];
			
			//underline code
			UIView *viewUnderline=[[UIView alloc] init];
			
			viewUnderline.frame = CGRectMake(scrollSize.width * 0.10, nickLabel.frame.origin.y + labelHeight + 1, scrollSize.width * 0.80, 1);
			viewUnderline.backgroundColor = [UIColor whiteColor];
			[_scrollView addSubview:viewUnderline];
		}
		_scrollView.contentSize = CGSizeMake(scrollSize.width, [_scores count] * yMult + yOffset );
		
	}
	else {
		UILabel *noScoreLabel = [[UILabel alloc] initWithFrame:CGRectMake(scrollSize.width/2 - nameLabelWidth/2, 60, nameLabelWidth, labelHeight)];
		noScoreLabel.font = [UIFont fontWithName:@"HelveticaNeue" size:16];
		noScoreLabel.textAlignment = NSTextAlignmentCenter;
		noScoreLabel.text = @"No Scores";
		noScoreLabel.backgroundColor = [UIColor clearColor];
		noScoreLabel.textColor = [UIColor whiteColor];
		[_scrollView addSubview:noScoreLabel];
	}
}


- (void) cleanScrollView {
	
	// clear ScrollView - remove all score labels
	for (UIView *subView in [_scrollView subviews]) {
		[subView removeFromSuperview];
	}
}

@end

