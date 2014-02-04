//
//  InfoViewController.m
//  BirdGame
//
//  Created by iOSdev on 1/3/14.
//  Copyright (c) 2014 Apportable. All rights reserved.
//

#import "InfoViewController.h"

@interface InfoViewController ()

@end

@implementation InfoViewController

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
#pragma View Lifecycl

- (void)viewDidLoad
{
    [super viewDidLoad];
    // Do any additional setup after loading the view from its nib.
	
	_contentView.backgroundColor = [UIColor colorWithRed:255.0/255.0 green:95.0/255.0 blue:0/255.0 alpha:1.0];
	_contentView.layer.borderColor = [UIColor colorWithWhite:0.175 alpha:1.0].CGColor;
	_contentView.layer.cornerRadius = 5.0;
	_contentView.layer.borderWidth = 2.0;
	
	_myWebView.delegate = self;
	
	[_myWebView setOpaque:NO];
	_myWebView.backgroundColor = [UIColor clearColor];
	[_myWebView loadRequest:[NSURLRequest requestWithURL:[NSURL fileURLWithPath:[[NSBundle mainBundle] pathForResource:@"info" ofType:@"html"] isDirectory:NO]]];
	
	
	// to remove shadow image on _myWebView
	for(UIView *subview in [[[_myWebView subviews] objectAtIndex:0] subviews]) {
		if ([subview isKindOfClass:[UIImageView class]]) {
			subview.hidden = YES;
		}
	}
}


/*
- (void)viewDidAppear:(BOOL)animated
{
    [super viewDidAppear:animated];
}

- (void) viewWillDisappear:(BOOL)animated {
	
	[super viewWillDisappear:animated];
}
*/


#pragma mark -
#pragma mark UIWebViewDelegate

-(BOOL) webView:(UIWebView *)inWeb shouldStartLoadWithRequest:(NSURLRequest *)inRequest navigationType:(UIWebViewNavigationType)inType {
    
	if ( inType == UIWebViewNavigationTypeLinkClicked ) {
        [[UIApplication sharedApplication] openURL:[inRequest URL]];
        return NO;
    }
    return YES;
}


@end
