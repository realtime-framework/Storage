//
//  ViewController.m
//  StorageExample
//
//  Created by RealTime on 09/09/2013.
//  Copyright (c) 2013 RealTime. All rights reserved.
//
//
//  RealTime Cloud Storage example - A simple TODO list
//  Purpose of this example is just to explain a usage of RealTime Cloud Storage Objective-C API
//
//  Structure of storage table:
//  - listName (NSString) - primary key
//  - timestamp (NSNumber) - secondary key
//  - task (NSString)      - description of task to do
//  - state (NSNumber)     - 0 if active, 1 if completed

#import "ViewController.h"
#import "TodoTableCell.h"
#import "RealTimeCloudStorage/RealTimeCloudStorage.h"


#define TABNAME @"todoTable"

@interface ViewController ()

@end

@implementation ViewController

@synthesize todoTableView;
@synthesize tfListName, tfTodo;
@synthesize storage;
@synthesize scFilter;

- (void)viewDidLoad {
    [super viewDidLoad];
    //change a height of UISegmentedControl
    NSLayoutConstraint *constraint = [NSLayoutConstraint constraintWithItem:scFilter
                                     attribute:NSLayoutAttributeHeight 
                                     relatedBy:NSLayoutRelationEqual
                                     toItem:nil
                                     attribute:NSLayoutAttributeNotAnAttribute
                                     multiplier:1 
                                     constant:25];
    [scFilter addConstraint:constraint];
    
    items = [[NSMutableDictionary alloc] init];
    
    selectAllAction = 0;
    isReconnecting = false;
    
    //initialize a Storage Reference
    //for security change the @"2Ze1dz" for your application key
    storage = [[StorageRef alloc] init:@"2Ze1dz" privateKey:nil authenticationToken:@"PM.Anonymous" isCluster:true isSecure:false url:@"http://storage-balancer.realtime.co/server/ssl/1.0"];
    
    //generate random list name
    listName = [self genRandStringLength:6];
    [tfListName setText:listName];
    
    [storage onReconnected:^(StorageRef *s){
        [items removeAllObjects];
        [self getItemsFromStorage];
    }];
    
    [self getItemsFromStorage];
}

- (void)getItemsFromStorage{
    TableRef *table = [storage table:TABNAME];
    //set a filter for table for property listName
    [table equalsString:@"listName" value:listName];

    void (^cbSuccess)(ItemSnapshot*) = ^(ItemSnapshot *item){//define block for a success callback
        if(item!=nil){
            NSDictionary *dic = [item val];
            [items setValue:dic forKey:[[dic objectForKey:@"timestamp"] stringValue]];
        } else { //we got all items
            [todoTableView reloadData];
        }
    };
    void (^cbError)(NSError*) = ^(NSError* e){ //define block for an error callback
        NSLog(@"### Error: %@", [e localizedDescription]);
    };
    [table getItems:cbSuccess error:cbError];
    
    //set actions to be perform for events: put, delete and update
    [table on:StorageEvent_PUT primaryKey:listName objectToNotify:self selectorToPerform:@selector(onNewItem:)];
    [table on:StorageEvent_DELETE primaryKey:listName objectToNotify:self selectorToPerform:@selector(onDeleteItem:)];
    [table on:StorageEvent_UPDATE primaryKey:listName objectToNotify:self selectorToPerform:@selector(onUpdateItem:)];
}

- (void) addItemToTableView:(NSDictionary*) newItem timestamp:(NSString*) timestamp {
    [items setValue:newItem forKey:timestamp];
    [todoTableView reloadData];
}

- (void) deleteItemFromTableView:(NSString*) timestamp{
    [items removeObjectForKey:timestamp];
    [todoTableView reloadData];
}

- (void) onNewItem:(ItemSnapshot*) item{
    NSDictionary* itemDic = [item val];
    NSString *timestamp = [[itemDic objectForKey:@"timestamp"] stringValue];
    if([items objectForKey:timestamp]==nil){
        [self addItemToTableView:itemDic timestamp:timestamp];
    }
}

- (void) onDeleteItem:(ItemSnapshot*) item{
    NSDictionary* itemDic = [item val];
    NSString *timestamp = [[itemDic objectForKey:@"timestamp"] stringValue];
    if([items objectForKey:timestamp]!=nil){
        [self deleteItemFromTableView:timestamp];
    }    
}

- (void) onUpdateItem:(ItemSnapshot*) item{
    NSDictionary* itemDic = [item val];
    NSString *timestamp = [[itemDic objectForKey:@"timestamp"] stringValue];
    NSDictionary* ourItem = [items objectForKey:timestamp];
    if(![itemDic isEqualToDictionary:ourItem]){
        [self addItemToTableView:itemDic timestamp:timestamp];
    }
}

- (IBAction) checkAll:(id)sender{
    //set all tasks states to completed or active (depends on sellectAllAction)
    NSMutableDictionary *changedItems = [[NSMutableDictionary alloc] init];
    for(NSString *itemKey in items){
        if( [[[items objectForKey:itemKey] objectForKey:@"state"] intValue] == 0 && selectAllAction == 0) {
            //item is active and we are marking all as completed
            NSMutableDictionary *itemDic = [[items objectForKey:itemKey] mutableCopy];
            [itemDic setValue:[NSNumber numberWithInt:1] forKey:@"state"];
            [changedItems setValue:itemDic forKey:itemKey];
            [[[storage table:TABNAME] item:listName secondaryKey:itemKey] set:itemDic success:nil error:nil];
        }
        if( [[[items objectForKey:itemKey] objectForKey:@"state"] intValue] == 1 && selectAllAction == 1) {
            //item is completed and we are marking all as active
            NSMutableDictionary *itemDic = [[items objectForKey:itemKey] mutableCopy];
            [itemDic setValue:[NSNumber numberWithInt:0] forKey:@"state"];
            [changedItems setValue:itemDic forKey:itemKey];
            [[[storage table:TABNAME] item:listName secondaryKey:itemKey] set:itemDic success:nil error:nil];
        }
    }
    [items addEntriesFromDictionary:changedItems];
    selectAllAction = (selectAllAction ? 0 : 1);    
    [todoTableView reloadData];
}

- (void)stateButtonPressed:(id)sender {
    //change the task state from active to completed or from completed to active
    UIButton *button = (UIButton *)sender;
    NSString *timestamp = [NSString stringWithFormat:@"%d", button.tag];
    NSMutableDictionary *itemDic = [[items objectForKey:timestamp] mutableCopy];
    if([[itemDic objectForKey:@"state"] intValue] == 0) {
        [itemDic setValue:[NSNumber numberWithInt:1] forKey:@"state"];
    } else {
        [itemDic setValue:[NSNumber numberWithInt:0] forKey:@"state"];
    }
    [items setValue:itemDic forKey:timestamp];
    [todoTableView reloadData];
    TableRef *table = [storage table:TABNAME];
    ItemRef *item = [table item:listName secondaryKey:timestamp];
    [item set:itemDic success:nil error:nil];
}

- (void)deleteButtonPressed:(id)sender{
    UIButton *button = (UIButton *)sender;
    [self deleteItemFromTableView:[NSString stringWithFormat:@"%d", button.tag]];
    TableRef *table = [storage table:TABNAME];
    ItemRef *item = [table item:listName secondaryKey:[NSString stringWithFormat:@"%d", button.tag]];
    [item del:nil error:nil];
}

- (BOOL)textFieldShouldReturn:(UITextField *)textField {
    NSString *newListName = [tfListName text];
    TableRef *table = [storage table:TABNAME];
    if([tfTodo.text length] > 0){ //new task has been defined
        NSNumber *ts = [NSNumber numberWithInt:(int)[[NSDate date] timeIntervalSince1970]];
        //prepare dictionary with item properties
        NSDictionary *newItem = [[NSDictionary alloc] initWithObjectsAndKeys:listName, @"listName", ts, @"timestamp", tfTodo.text, @"task", [NSNumber numberWithInt:0], @"state", nil];
        [self addItemToTableView:newItem timestamp:[NSString stringWithFormat:@"%@", ts]];
        [table push:newItem success:nil error: nil];
        [tfTodo setText:@""];
    }
    if(![newListName isEqualToString:listName]){ //list name has been changed
        //remove listeners for old list
        [table off:StorageEvent_PUT primaryKey:listName objectToNotify:self selectorToPerform:@selector(onNewItem:)];
        [table off:StorageEvent_DELETE primaryKey:listName objectToNotify:self selectorToPerform:@selector(onDeleteItem:)];
        [table off:StorageEvent_UPDATE primaryKey:listName objectToNotify:self selectorToPerform:@selector(onUpdateItem:)];
        [items removeAllObjects];
        listName = newListName;
        [self getItemsFromStorage];
    }
    [textField resignFirstResponder];
    return YES;
}

- (IBAction) onFilterChange:(id)sender{
    [todoTableView reloadData];
}

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section {
    if([scFilter selectedSegmentIndex] == 0){ //all items
        timestampsToShow = [[items allKeys] sortedArrayUsingSelector:@selector(compare:)];;
    } else { //only active or completed
        NSInteger state = [scFilter selectedSegmentIndex] - 1;
        NSMutableArray *temp = [[NSMutableArray alloc] init];
        for(NSString *itemKey in items){
            if( [[[items objectForKey:itemKey] objectForKey:@"state"] intValue] == state){
                [temp addObject:itemKey];
            }
        }
        timestampsToShow = [temp sortedArrayUsingSelector:@selector(compare:)];
    }
    return [timestampsToShow count];
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath{
    static NSString *CellIdentifier = @"TodoCell";
    TodoTableCell *cell;    
    cell = [tableView dequeueReusableCellWithIdentifier:CellIdentifier];
    if (cell == nil) {
        NSArray *nib = [[NSBundle mainBundle] loadNibNamed:@"TodoCell" owner:self options:nil];
        cell = [nib objectAtIndex:0];
    }

    NSDictionary *dic = [items objectForKey:[timestampsToShow objectAtIndex:indexPath.row]];
    cell.cellLabel.text = [dic objectForKey:@"task"];
    if([[dic objectForKey:@"state"] intValue] == 0) {//this task is active
        [cell.imgButton setImage:[UIImage imageNamed:@"check_off.png"] forState:UIControlStateNormal];
        cell.cellLabel.textColor = [UIColor colorWithRed:0 green:0 blue:0 alpha:1];
    } else { //this task is completed
        [cell.imgButton setImage:[UIImage imageNamed:@"check_on.png"] forState:UIControlStateNormal];
        cell.cellLabel.textColor = [UIColor colorWithRed:0.5 green:0.5 blue:0.5 alpha:1];
    }
    //assign actions for buttons in tableview cell
    [cell.imgButton addTarget:self action:@selector(stateButtonPressed:) forControlEvents:UIControlEventTouchUpInside];
    [cell.delButton addTarget:self action:@selector(deleteButtonPressed:) forControlEvents:UIControlEventTouchUpInside];

    //assign buttons tags as a task's timestamp
    int timestamp = [[timestampsToShow objectAtIndex:indexPath.row] intValue];
    [cell.imgButton setTag: timestamp];
    [cell.delButton setTag: timestamp];
    return cell;
}

NSString *letters = @"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
-(NSString *) genRandStringLength: (int) len {
    NSMutableString *randomString = [NSMutableString stringWithCapacity: len];
    for (int i=0; i<len; i++)
         [randomString appendFormat: @"%C", [letters characterAtIndex: arc4random() % [letters length]]];
    return randomString;
}
/*
- (void) compareItemsWithStorageItems:(NSMutableDictionary*)storageItems{
    NSMutableDictionary *changedItems = [[NSMutableDictionary alloc] init];
    NSMutableArray *deletedTimestamps = [[NSMutableArray alloc] init];
    for(NSString *timestamp in items){
        NSDictionary *localItem = [items objectForKey:timestamp];
        NSDictionary *storageItem = [storageItems objectForKey:timestamp];
        NSDictionary *lastSyncItem = [lastSyncItems objectForKey:timestamp];
        if(storageItem==nil){
            if(lastSyncItems==nil) {
                //item that is not saved on storage yet
                [[storage table:TABNAME] push:localItem success:nil error: nil];
            } else {
                //item was removed from storage
                [deletedTimestamps addObject:timestamp];
            }
        } else if(![localItem isEqualToDictionary:storageItem]) {
            if([lastSyncItem isEqualToDictionary:storageItem]){
                //item was modified localy while we were offline
                [[storage table:TABNAME] push:localItem success:nil error: nil];
            } else if(localItem isEqualToDictionary:lastSyncItem) {
                
            }
            
        }
    }
}
*/
@end
