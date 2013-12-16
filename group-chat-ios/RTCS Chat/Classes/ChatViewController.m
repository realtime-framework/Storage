//
//  ChatViewController.m
//  RTCS Chat
//
//  Created by iOSdev on 11/7/13.
//  Copyright (c) 2013 Realtime.co. All rights reserved.
//

#import "ChatViewController.h"
#import "StorageManager.h"

@interface ChatViewController ()

@end

@implementation ChatViewController

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

- (void) viewDidLoad
{
	UIBarButtonItem *composeButton = [[UIBarButtonItem alloc] initWithBarButtonSystemItem:UIBarButtonSystemItemCompose target:self action:@selector(composeAction:)];
	[[self navigationItem] setRightBarButtonItem:composeButton];
	
    [super viewDidLoad];
    // Do any additional setup after loading the view from its nib.
    
    _items = [[NSMutableArray alloc] init];
    
	self.view.backgroundColor = [UIColor clearColor];
    _myTableView.backgroundColor = [UIColor clearColor];
    
    UIImageView *imageView = [[UIImageView alloc] initWithImage:[UIImage imageNamed:@"background.png"]];
    imageView.contentMode = UIViewContentModeBottom;
    _myTableView.backgroundView = imageView;
	
	_myActivityIndicator = [[UIActivityIndicatorView alloc] initWithActivityIndicatorStyle:UIActivityIndicatorViewStyleWhiteLarge];
	_myActivityIndicator.center = CGPointMake(self.view.center.x, (self.view.center.y*0.75));
	_myActivityIndicator.hidesWhenStopped = YES;
	[self.view addSubview:_myActivityIndicator];
	_didAppearOnce = NO;
}


- (void) viewDidUnload {
    
    [self setMyTableView:nil];
    [super viewDidUnload];
    // Release any retained subviews of the main view.
    // e.g. self.myOutlet = nil;
}

/*
- (void)viewWillAppear:(BOOL)animated
{
    [super viewWillAppear:animated];
}
*/
- (void)viewDidAppear:(BOOL)animated
{
	if (!_didAppearOnce) {
		_didAppearOnce = YES;
		[self getItemsForChatRoom:self.title];
	}
	[super viewDidAppear:animated];
}
/*
- (void)viewWillDisappear:(BOOL)animated
{
    [super viewWillDisappear:animated];
}

- (void)viewDidDisappear:(BOOL)animated
{
    [super viewDidDisappear:animated];
}
*/


#pragma mark -
#pragma mark UITableViewDataSource

- (int)tableView:(UITableView*)tableView numberOfRowsInSection:(NSInteger)section
{
    return [_items count];
}

- (UITableViewCell*)tableView:(UITableView*)tableView cellForRowAtIndexPath:(NSIndexPath*)indexPath
{
    static NSString* CellIdentifier = @"MessageCellIdentifier";
    
	MessageTableViewCell* cell = (MessageTableViewCell*)[tableView dequeueReusableCellWithIdentifier:CellIdentifier];
	if (cell == nil) {
		cell = [[MessageTableViewCell alloc] initWithStyle:UITableViewCellStyleDefault reuseIdentifier:CellIdentifier];
    }
    
    NSDictionary *message = [_items objectAtIndex:indexPath.row];
    [cell setMessage:message];
    
    if ([[message objectForKey:@"nickName"] isEqualToString:[StorageManager sharedManager].nickName]) {
        
        UILongPressGestureRecognizer *longPress = [[UILongPressGestureRecognizer alloc] initWithTarget:self action:@selector(longPressHandle:)];
        longPress.minimumPressDuration = 0.85;
        [cell addGestureRecognizer:longPress];
    }
    
    return cell;
}

#pragma mark -
#pragma mark UITableView Delegate

- (CGFloat)tableView:(UITableView*)tableView heightForRowAtIndexPath:(NSIndexPath*)indexPath
{
	// This function is called before cellForRowAtIndexPath, once for each cell.
	// We calculate the size of the speech bubble here and then cache it in the
	// Message object, so we don't have to repeat those calculations every time
	// we draw the cell. We add 16px for the label that sits under the bubble.
    
	NSDictionary *message = [_items objectAtIndex:[indexPath row]];
    CGSize bubbleSize = [SpeechBubbleView sizeForText:[message objectForKey:@"message"]];
    
	return bubbleSize.height + 16;
}


#pragma mark - Actions

- (void) scrollToNewestMessage
{
	// The newest message is at the bottom of the table
	NSIndexPath* indexPath = [NSIndexPath indexPathForRow:([_items count] - 1) inSection:0];
	[_myTableView scrollToRowAtIndexPath:indexPath atScrollPosition:UITableViewScrollPositionTop animated:YES];
	
	if ([_items count] < 1) {
        
        UILabel* label = [[UILabel alloc] initWithFrame:CGRectMake(0, 0, self.view.bounds.size.width, 30)];
        label.text = @"You have no messages";
        label.font = [UIFont fontWithName:@"Helvetica Neue" size:16];
        label.textAlignment = NSTextAlignmentCenter;
        //label.textColor = [UIColor colorWithRed:76.0f/255.0f green:86.0f/255.0f blue:108.0f/255.0f alpha:1.0f];
        label.textColor = [UIColor whiteColor];
        label.backgroundColor = [UIColor clearColor];
        label.autoresizingMask = UIViewAutoresizingFlexibleLeftMargin | UIViewAutoresizingFlexibleRightMargin;
        _myTableView.tableFooterView = label;
    }
}


- (void) receivedMessage:(NSDictionary *) message OnChatRoom:(NSString *) chatRoom {
    
    [_items addObject:message];
    
    if ([self isViewLoaded])
    {
        _myTableView.tableFooterView = nil;
        [_myTableView insertRowsAtIndexPaths:@[[NSIndexPath indexPathForRow:([_items count] - 1) inSection:0]] withRowAnimation:UITableViewRowAnimationBottom];
        [self scrollToNewestMessage];
    }
}

- (void) deletedMessage:(NSDictionary *) message OnChatRoom:(NSString *) chatRoom {
    
    NSIndexPath *indexPathToRemove = [NSIndexPath indexPathForItem:[_items indexOfObject:message] inSection:0];
    [_items removeObject:message];
	
	if ([self isViewLoaded])
    {
        _myTableView.tableFooterView = nil;
        [_myTableView deleteRowsAtIndexPaths:[NSArray arrayWithObject:indexPathToRemove] withRowAnimation:UITableViewRowAnimationBottom];
        [self scrollToNewestMessage];
        _longPressedCell = nil;
    }
}

- (BOOL)canBecomeFirstResponder {
    return YES;
}

- (void) longPressHandle:(UIGestureRecognizer *) sender {
    
    [self becomeFirstResponder];
    if (sender.state == UIGestureRecognizerStateBegan) {
        
        CGPoint tapPoint = [sender locationInView:sender.view];
        //Do Whatever You want on End of Gesture
        _longPressedCell = (MessageTableViewCell *)[sender view];
        
        UIMenuItem *delete = [[UIMenuItem alloc] initWithTitle:@"Delete" action:@selector(deleteMessage:)];
        UIMenuController *menu = [UIMenuController sharedMenuController];
		[menu setMenuItems:[NSArray arrayWithObjects:delete, nil]];
		[menu setTargetRect:CGRectMake(tapPoint.x, (tapPoint.y - _longPressedCell.label.frame.size.height) , 1, 1) inView:_longPressedCell];
        [menu setMenuVisible:YES animated:YES];
    }
}


- (void) deleteMessage:(id)sender {
	
	ItemRef *item = [[StorageManager sharedManager].tableRef item:[_longPressedCell.message objectForKey:PRIMARY_KEY] secondaryKey:[_longPressedCell.message objectForKey:SECONDARY_KEY]];
	
	[item del:^(ItemSnapshot *item) {
        NSLog(@"Item:\n%@\nDeleted with Successfully", [item val]);
    } error:^(NSError *error) {
        NSLog(@"Error Deleting item\nERROR: %@", [error description]);
    }];
}


- (void)copy:(id)sender
{
    [[UIPasteboard generalPasteboard] setString:[_longPressedCell.message objectForKey:@"message"]];
}


- (BOOL)canPerformAction:(SEL)action withSender:(id)sender {
    
	if (action == @selector(copy:) || action == @selector(deleteMessage:)) {
		return YES;
	}
	return NO;
}


- (void) composeAction:(id)sender
{
    // Show the Compose screen
    ComposeViewController* composeController = [[ComposeViewController alloc] initWithNibName:@"ComposeViewController" bundle:nil];
    
    composeController.delegate = self;
    composeController.chatRoom = self.title;
    [self.navigationController presentViewController:composeController animated:YES completion:nil];
}

#pragma mark - RealTimeCloudStorage

- (void) getItemsForChatRoom:(NSString *) chatRoom {
	
	void (^cbSuccess)(ItemSnapshot*) = ^(ItemSnapshot *item) {//define block for a success callback
        if(item!=nil){
            NSDictionary *dic = [item val];
			//NSLog(@"dic: %@", dic);
			[_items addObject:dic];
		}
        else {
            //we got all items
            if ([_items count] > 0) {
                _myTableView.tableFooterView = nil;
                [_myTableView reloadData];
                [self scrollToNewestMessage];
				[_myActivityIndicator stopAnimating];
            }
            else {
                UILabel* label = [[UILabel alloc] initWithFrame:CGRectMake(0, 0, self.view.bounds.size.width, 30)];
                label.text = @"You have no messages";
                label.font = [UIFont fontWithName:@"Helvetica Neue" size:16];
                label.textAlignment = NSTextAlignmentCenter;
                label.textColor = [UIColor whiteColor];
                label.backgroundColor = [UIColor clearColor];
                label.autoresizingMask = UIViewAutoresizingFlexibleLeftMargin | UIViewAutoresizingFlexibleRightMargin;
                _myTableView.tableFooterView = label;
				[_myActivityIndicator stopAnimating];
            }
        }
    };
    void (^cbError)(NSError*) = ^(NSError* e){ //define block for an error callback
        NSLog(@"### Error: %@", [e localizedDescription]);
    };
	
	[_myActivityIndicator startAnimating];
	[_items removeAllObjects];
	
	NSTimeInterval tenDays = 10 * 24 * 60 * 60; // days * hours * min * seconds
	NSString *timeStamp = [[NSNumber numberWithInt:[NSDate timeIntervalSinceReferenceDate] - tenDays] stringValue];
	
	[[StorageManager sharedManager].tableRef equalsString:PRIMARY_KEY value:chatRoom];
	[[StorageManager sharedManager].tableRef greaterEqualString:SECONDARY_KEY value:timeStamp];
    [[StorageManager sharedManager].tableRef getItems:cbSuccess error:cbError];
}


#pragma mark - ComposeDelegate

- (void) didComposeMessage:(NSString *)message ToChatRoom:(NSString *) chatRoom
{
	// This method is called when the user presses Save in the Compose screen,
	// but also when a push notification is received. We remove the "There are
	// no messages" label from the table view's footer if it is present, and
	// add a new row to the table view with a nice animation.
    
    NSString *timeStamp = [[NSNumber numberWithInt:(int)[NSDate timeIntervalSinceReferenceDate]] stringValue];
    
    // Format the message date
	NSDateFormatter *dateFormatter = [[NSDateFormatter alloc] init];
    [dateFormatter setDateFormat:@"dd MMM yyyy, HH:mm"];
    NSString *dateString = [dateFormatter stringFromDate:[NSDate date]];
    
	NSDictionary *newItem = [[NSDictionary alloc] initWithObjectsAndKeys:self.title, PRIMARY_KEY, timeStamp, SECONDARY_KEY, message, @"message", [StorageManager sharedManager].nickName, @"nickName", dateString, @"date", nil];
	
    [[StorageManager sharedManager].tableRef push:newItem
										  success:^(ItemSnapshot *item) {
											  NSLog(@"Item:\n%@\nWrite Successfully", [item val]);
										  }
											error:^(NSError *error) {
												NSLog(@"Error Writing item\nERROR: %@", [error description]);
											}
     ];
}

@end
