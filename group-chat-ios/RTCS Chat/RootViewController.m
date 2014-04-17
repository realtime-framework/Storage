//
//  RootViewController.m
//  RTCS Chat
//
//  Created by iOSdev on 11/7/13.
//  Copyright (c) 2013 Realtime.co. All rights reserved.
//

#import "RootViewController.h"
#import "ChatViewController.h"



@interface RootViewController ()

@end

@implementation RootViewController

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


#pragma mark - View lifecycle

- (void)viewDidLoad
{
    [super viewDidLoad];
    // Do any additional setup after loading the view from its nib.
    
    self.title = @"RTCS Chat";
    self.navigationController.navigationBar.barStyle = UIBarStyleBlack;
    
    // check for internet connection
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(reachabilityChanged:)
                                                 name:kReachabilityChangedNotification object:nil];
    
    _internetReachable = [Reachability reachabilityWithHostname:@"www.realtime.co"];
    [_internetReachable startNotifier];
	
	_myActivityIndicator = [[UIActivityIndicatorView alloc] initWithActivityIndicatorStyle:UIActivityIndicatorViewStyleWhiteLarge];
	_myActivityIndicator.center = CGPointMake(self.view.center.x, (self.view.center.y));
	_myActivityIndicator.hidesWhenStopped = YES;
	[self.view addSubview:_myActivityIndicator];
	[_myActivityIndicator startAnimating];
    
    _statusLabel.backgroundColor = [UIColor whiteColor];
    _statusLabel.layer.borderColor = [UIColor blackColor].CGColor;
    _statusLabel.layer.borderWidth = 1.0;
    _statusLabel.layer.cornerRadius = 8.0;
    
    [StorageManager sharedManager].chatDelegate = self;
    
    if ([StorageManager sharedManager].nickName != nil && [[StorageManager sharedManager].nickName length] > 0) {
        
        _nickNameTextField.alpha = 0.0;
        _welcomeLabel.text = [NSString stringWithFormat:@"Welcome %@!", [StorageManager sharedManager].nickName];
    }
    else {
        [StorageManager sharedManager].nickName = @"";
        _welcomeLabel.alpha = 0.0;
        _chatRoomsBtt.enabled = NO;
    }
    
    _nickNameTextField.delegate = self;
}


- (void) viewDidUnload {
    
    [[NSNotificationCenter defaultCenter] removeObserver:self];
    
    [self setStatusLabel:nil];
    [self setChatRoomsBtt:nil];
    [self setNickNameTextField:nil];
    [self setWelcomeLabel:nil];
    [super viewDidUnload];
    // Release any retained subviews of the main view.
    // e.g. self.myOutlet = nil;
}

/*
- (void)viewWillAppear:(BOOL)animated
{
    [super viewWillAppear:animated];
}

- (void)viewDidAppear:(BOOL)animated
{
    [super viewDidAppear:animated];
}

- (void)viewWillDisappear:(BOOL)animated
{
    [super viewWillDisappear:animated];
}

- (void)viewDidDisappear:(BOOL)animated
{
    [super viewDidDisappear:animated];
}
*/

- (BOOL)shouldAutorotateToInterfaceOrientation:(UIInterfaceOrientation)interfaceOrientation
{
    //return YES;
    return (interfaceOrientation == UIInterfaceOrientationPortrait);
}


#pragma mark - Action

- (void) configureView {
    
    if (_isInternetActive) {
        _statusLabel.text = @"Got Connection";
        
        if ([StorageManager sharedManager].nickName != nil && [[StorageManager sharedManager].nickName length] > 0 && [StorageManager sharedManager].storageRef) {
            
            _chatRoomsBtt.enabled = YES;
        }
        else {
            _chatRoomsBtt.enabled = NO;
        }
	}
    else {
        _chatRoomsBtt.enabled = NO;
        _statusLabel.text = @"No Internet Connection Available!";
	}
	[_myActivityIndicator stopAnimating];
}


- (IBAction) showChatRooms:(id)sender
{
    _roomsTableViewController = [[RoomsTableViewController alloc] initWithNibName:@"RoomsTableViewController" bundle:nil];
    
    [self.navigationController pushViewController:_roomsTableViewController animated:YES];
    
    if ([[StorageManager sharedManager].chatRooms count] < 1) {
        [_roomsTableViewController setEditing:YES animated:YES];
    }
}
    


#pragma mark - ChatRoomDelegate

- (void) receivedMessage:(NSDictionary *) message OnChatRoom:(NSString *) chatRoom {
    
    if ([[self.navigationController viewControllers] count] > 2) {
        ChatViewController *chat = (ChatViewController *)[[self.navigationController viewControllers] objectAtIndex:2];
        
        if ([chatRoom isEqualToString:chat.title]) {
            [chat receivedMessage:message OnChatRoom:chatRoom];
        }
        else {
            int unreadMsgs = [[[StorageManager sharedManager].unreadMsgsToChatRooms objectForKey:chatRoom] intValue];
            unreadMsgs++;
            [[StorageManager sharedManager].unreadMsgsToChatRooms setValue:[NSNumber numberWithInt:unreadMsgs] forKey:chatRoom];
            [_roomsTableViewController.tableView reloadData];
        }
    }
    else {
        int unreadMsgs = [[[StorageManager sharedManager].unreadMsgsToChatRooms objectForKey:chatRoom] intValue];
        unreadMsgs++;
        [[StorageManager sharedManager].unreadMsgsToChatRooms setValue:[NSNumber numberWithInt:unreadMsgs] forKey:chatRoom];
        [_roomsTableViewController.tableView reloadData];
    }
}


- (void) deleteMessage:(NSDictionary *) message OnChatRoom:(NSString *) chatRoom {
    
    if ([[self.navigationController viewControllers] count] > 2) {
        ChatViewController *chat = (ChatViewController *)[[self.navigationController viewControllers] objectAtIndex:2];
        
        if ([chatRoom isEqualToString:chat.title]) {
            [chat deletedMessage:message OnChatRoom:chatRoom];
        }
        else {
            int unreadMsgs = [[[StorageManager sharedManager].unreadMsgsToChatRooms objectForKey:chatRoom] intValue];
            unreadMsgs--;
            [[StorageManager sharedManager].unreadMsgsToChatRooms setValue:[NSNumber numberWithInt:unreadMsgs] forKey:chatRoom];
            [_roomsTableViewController.tableView reloadData];
        }
    }
    else {
        int unreadMsgs = [[[StorageManager sharedManager].unreadMsgsToChatRooms objectForKey:chatRoom] intValue];
        unreadMsgs--;
        [[StorageManager sharedManager].unreadMsgsToChatRooms setValue:[NSNumber numberWithInt:unreadMsgs] forKey:chatRoom];
        [_roomsTableViewController.tableView reloadData];
    }
}


- (void) refreshChatRoom {
	if ([[self.navigationController viewControllers] count] > 2) {
        ChatViewController *chat = (ChatViewController *)[[self.navigationController viewControllers] objectAtIndex:2];
        [chat getItemsForChatRoom:chat.title];
    }
}


#pragma mark Reachability NetworkStatus

- (void) reachabilityChanged:(NSNotification*) notification
{
    Reachability *internetReachable = [notification object];
    if ([internetReachable isReachable]) {
        
        //NSLog(@"Notification Says Reachable");
        _isInternetActive = YES;
        _statusLabel.text = @"We got Connection";
    }
    else {
        
        //NSLog(@"Notification Says UNReachable");
        _isInternetActive = NO;
        _statusLabel.text = @"No Internet Connection Available!";
        
        UIAlertView *alert = [[UIAlertView alloc] initWithTitle:@"" message:@"Connection Lost" delegate:nil cancelButtonTitle:@"OK" otherButtonTitles:nil];
        [alert show];
        
        [self.navigationController popToRootViewControllerAnimated:YES];
    }
    [self configureView];
}


#pragma mark - UITextField delegate

- (BOOL)textField:(UITextField *)field shouldChangeCharactersInRange:(NSRange)range replacementString:(NSString *)characters
{
    NSCharacterSet *invalidCharSet = [NSCharacterSet characterSetWithCharactersInString:@""];
    if (field == _nickNameTextField)
    {
        invalidCharSet = [NSCharacterSet characterSetWithCharactersInString:@":"];
    }
    NSString *filtered = [[characters componentsSeparatedByCharactersInSet:invalidCharSet] componentsJoinedByString:@""];
    
    return [characters isEqualToString:filtered];
}

- (BOOL) textFieldShouldReturn:(UITextField *)textField {
    
    [textField resignFirstResponder];
    if (textField == _nickNameTextField) {
        
        if (_nickNameTextField.text != nil && [_nickNameTextField.text length] > 0) {
            
            [[StorageManager sharedManager] saveNickName:_nickNameTextField.text];
            _welcomeLabel.text = [NSString stringWithFormat:@"Welcome %@!", [StorageManager sharedManager].nickName];
            
            [UIView animateWithDuration:0.20 delay:0.0 options:UIViewAnimationOptionCurveEaseIn
                             animations:^{
                                 
                                 _nickNameTextField.alpha = 0.0;
                                 _welcomeLabel.alpha =  1.0;
                             }
                             completion:^(BOOL finished) {
                                 _chatRoomsBtt.enabled = YES;
                             }];
        }
        else {
            UIAlertView *alertView = [[UIAlertView alloc] initWithTitle:@"" message:@"NO, that's not your Nickname" delegate:self cancelButtonTitle:@"OK" otherButtonTitles:nil];
            [alertView show];
            
            return NO;
        }
    }
    return YES;
}


@end
