//
//  RoomsTableViewController.m
//  RTCS Chat
//
//  Created by iOSdev on 11/7/13.
//  Copyright (c) 2013 Realtime.co. All rights reserved.
//

#import "RoomsTableViewController.h"
#import "ChatViewController.h"

@interface RoomsTableViewController ()

@end

@implementation RoomsTableViewController

- (id)initWithStyle:(UITableViewStyle)style
{
    self = [super initWithStyle:style];
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
    
    // Uncomment the following line to preserve selection between presentations.
    // self.clearsSelectionOnViewWillAppear = NO;
    
    // Uncomment the following line to display an Edit button in the navigation bar for this view controller.
    // self.navigationItem.rightBarButtonItem = self.editButtonItem;
    
    self.navigationController.navigationBar.barStyle = UIBarStyleBlack;
    [[self navigationItem] setRightBarButtonItem:[self editButtonItem]];
    self.title = @"Chat Rooms";
    
    self.view.backgroundColor = [UIColor clearColor];
    self.tableView.backgroundColor = [UIColor clearColor];
    
    UIImageView *imageView = [[UIImageView alloc] initWithImage:[UIImage imageNamed:@"background.png"]];
    imageView.contentMode = UIViewContentModeBottom;
    self.tableView.backgroundView = imageView;
}



- (void)viewWillAppear:(BOOL)animated
{
    [super viewWillAppear:animated];
    [self.tableView reloadData];
}

/*
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


#pragma mark - Table view data source

//  Override inherited method to enable/disable Edit button
- (void)setEditing:(BOOL)editing animated:(BOOL)animated
{
    animated = YES;
    [super setEditing:editing animated:animated];
    
    [self.tableView setEditing:editing animated:animated];
    [self.tableView  performSelector:@selector(reloadData) withObject:nil afterDelay:0.25];
    
    if (!editing) {
        
        if (SYSTEM_VERSION_LESS_THAN(@"7.0")) {
            [self.tableView setContentOffset:CGPointMake(0, 0) animated:YES];
        }
        else {
            [self.tableView setContentOffset:CGPointMake(0, -64) animated:YES];
        }
        
        if (_myNewChatRoomTextField.text != nil && [_myNewChatRoomTextField.text length] > 0) {
            [self textFieldShouldReturn:_myNewChatRoomTextField];
        }
    }
    else {
        if ([[StorageManager sharedManager].chatRooms count] > 10) {
            [self.tableView setContentOffset:CGPointMake(0, self.tableView .contentSize.height - self.tableView .frame.size.height + 46) animated:YES];
        }
    }
}


- (NSInteger)numberOfSectionsInTableView:(UITableView *)tableView
{
    // Return the number of sections.
    return 1;
}

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section
{
    // Return the number of rows in the section.
    int rows = [[StorageManager sharedManager].chatRooms count];
    
    if (self.tableView.editing) {
        return rows + 1;
    }
    return rows;
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath
{
    static NSString *cellIdentifier = @"CellIdentifier";
    UITableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:cellIdentifier];
    
    if (cell == nil) {
        cell = [[UITableViewCell alloc] initWithStyle:UITableViewCellStyleDefault reuseIdentifier:cellIdentifier];
    }
    
    // Configure the cell...
    if (tableView.editing && indexPath.row == [[StorageManager sharedManager].chatRooms count]) {
        
        _myNewChatRoomTextField = [[UITextField alloc] initWithFrame:CGRectMake(10, 8, 250, cell.frame.size.height - 15)];
        _myNewChatRoomTextField.delegate = self;
        _myNewChatRoomTextField.borderStyle = UITextBorderStyleRoundedRect;
        _myNewChatRoomTextField.placeholder = @"Enter ChatRoom Name Here";
        _myNewChatRoomTextField.font = [UIFont fontWithName:@"Helvetica Neue" size:16];
        _myNewChatRoomTextField.backgroundColor = [UIColor whiteColor];
        
        [cell.contentView addSubview:_myNewChatRoomTextField];
        cell.textLabel.text = @"";
        cell.textLabel.font = [UIFont fontWithName:@"Helvetica Neue" size:16];
        
        cell.backgroundColor = [UIColor clearColor];
        cell.textLabel.backgroundColor = [UIColor clearColor];
        
        return cell;
    }
    
    for (UIView *cellSubView in [cell.contentView subviews]) {
        [cellSubView removeFromSuperview];
    }
    
    cell.backgroundColor = [UIColor clearColor];
    cell.contentView.backgroundColor = [UIColor clearColor];
    cell.textLabel.font = [UIFont fontWithName:@"Helvetica Neue" size:16];
    cell.textLabel.textColor = [UIColor whiteColor];
    
    cell.textLabel.text = [[StorageManager sharedManager].chatRooms objectAtIndex:indexPath.row];
    cell.textLabel.backgroundColor = [UIColor clearColor];
    cell.accessoryType = UITableViewCellAccessoryDisclosureIndicator;
    
    if ([[[StorageManager sharedManager].unreadMsgsToChatRooms objectForKey:[[StorageManager sharedManager].chatRooms objectAtIndex:indexPath.row]] intValue] > 0) {
        
        NSString *unreadMsg = [NSString stringWithFormat:@" %d ", [[[StorageManager sharedManager].unreadMsgsToChatRooms objectForKey:[[StorageManager sharedManager].chatRooms objectAtIndex:indexPath.row]] intValue]];
        
        UILabel *unreadLabel = [[UILabel alloc] init];
        unreadLabel.font = [UIFont fontWithName:@"Helvetica Neue" size:14];
        unreadLabel.text = unreadMsg;
        unreadLabel.textColor = [UIColor whiteColor];
        unreadLabel.backgroundColor = [UIColor colorWithRed:220/255.0 green:55/255.0 blue:35/255.0 alpha:1.0];
        unreadLabel.numberOfLines = 1;
        unreadLabel.layer.borderColor = [UIColor darkGrayColor].CGColor;
        unreadLabel.layer.borderWidth = 1.0;
        unreadLabel.layer.cornerRadius = 6.0;
        unreadLabel.textAlignment = NSTextAlignmentCenter;
        
        CGSize maximumLabelSize = CGSizeMake(100, 20);
        CGSize expectedLabelSize = [unreadMsg sizeWithFont:unreadLabel.font constrainedToSize:maximumLabelSize lineBreakMode:unreadLabel.lineBreakMode];
        
        unreadLabel.frame = CGRectMake(250, (cell.frame.size.height - (expectedLabelSize.height + 5))/2, expectedLabelSize.width + 5, expectedLabelSize.height + 5);
        [cell.contentView addSubview:unreadLabel];
    }
    
    return cell;
}


/*
// Override to support conditional editing of the table view.
- (BOOL)tableView:(UITableView *)tableView canEditRowAtIndexPath:(NSIndexPath *)indexPath
{
    // Return NO if you do not want the specified item to be editable.
    return YES;
}
*/

- (UITableViewCellEditingStyle)tableView:(UITableView *)tableView editingStyleForRowAtIndexPath:(NSIndexPath *)indexPath
{
    if (tableView.editing && indexPath.row == ([[StorageManager sharedManager].chatRooms count])) {
        //gives green circle with +
		return UITableViewCellEditingStyleInsert;
	} else {
		return UITableViewCellEditingStyleDelete;
	}
    //or UITableViewCellEditingStyleNone
    return UITableViewCellEditingStyleNone;
}


// Override to support editing the table view.
- (void)tableView:(UITableView *)tableView commitEditingStyle:(UITableViewCellEditingStyle)editingStyle forRowAtIndexPath:(NSIndexPath *)indexPath
{
    if (editingStyle == UITableViewCellEditingStyleDelete) {
        // Delete the row from the data source
        [[StorageManager sharedManager] removeChatRoom:[[StorageManager sharedManager].chatRooms objectAtIndex:indexPath.row]];
        [self.tableView reloadData];
    }
    else if (editingStyle == UITableViewCellEditingStyleInsert) {
        
        // Create a new instance of the appropriate class, insert it into the array, and add a new row to the table view
        if (_myNewChatRoomTextField.text != nil && [_myNewChatRoomTextField.text length] > 0) {
            [[StorageManager sharedManager] addChatRoom:_myNewChatRoomTextField.text];
            [self.tableView reloadData];
        }
        else {
            UIAlertView *alertView = [[UIAlertView alloc] initWithTitle:@"" message:@"You should provide a name for the new ChatRoom." delegate:self cancelButtonTitle:@"OK" otherButtonTitles:nil];
            [alertView show];
        }
    }
}

/*
// Override to support rearranging the table view.
- (void)tableView:(UITableView *)tableView moveRowAtIndexPath:(NSIndexPath *)fromIndexPath toIndexPath:(NSIndexPath *)toIndexPath
{
}
*/
/*
// Override to support conditional rearranging of the table view.
- (BOOL)tableView:(UITableView *)tableView canMoveRowAtIndexPath:(NSIndexPath *)indexPath
{
    // Return NO if you do not want the item to be re-orderable.
    return YES;
}
*/

#pragma mark - Table view delegate

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath
{
    // Navigation logic may go here. Create and push another view controller.
    NSString *chatRoom = [[StorageManager sharedManager].chatRooms objectAtIndex:indexPath.row];
    
    [[StorageManager sharedManager].unreadMsgsToChatRooms setValue:[NSNumber numberWithInt:0] forKey:chatRoom];
    
    ChatViewController *chatController = [[ChatViewController alloc] initWithNibName:@"ChatViewController" bundle:nil];
    chatController.title = chatRoom;
    
    [tableView deselectRowAtIndexPath:indexPath animated:YES];
    [self.navigationController pushViewController:chatController animated:YES];

}

#pragma mark - UITextField delegate

- (void) textFieldDidBeginEditing:(UITextField *)textField {
    
    if (textField == _myNewChatRoomTextField && [[StorageManager sharedManager].chatRooms count] > 3) {
        [self.tableView setContentOffset:CGPointMake(0, self.tableView.contentSize.height - self.tableView.frame.size.height/2 + 12) animated:YES];
    }
}


- (BOOL)textField:(UITextField *)field shouldChangeCharactersInRange:(NSRange)range replacementString:(NSString *)characters
{
    NSCharacterSet *invalidCharSet = [NSCharacterSet characterSetWithCharactersInString:@""];
    if (field == _myNewChatRoomTextField)
    {
        invalidCharSet = [[NSCharacterSet characterSetWithCharactersInString:@"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_./\\"] invertedSet];
    }
    NSString *filtered = [[characters componentsSeparatedByCharactersInSet:invalidCharSet] componentsJoinedByString:@""];
    
    return [characters isEqualToString:filtered];
}

- (BOOL) textFieldShouldReturn:(UITextField *)textField {
    
    [textField resignFirstResponder];
    
    if (textField == _myNewChatRoomTextField) {
        
        [self tableView:self.tableView commitEditingStyle:UITableViewCellEditingStyleInsert forRowAtIndexPath:[NSIndexPath indexPathForRow:[[StorageManager sharedManager].chatRooms count] inSection:0]];
    }
    
    return YES;
}

@end
