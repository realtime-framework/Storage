//
//  ViewController.h
//  StorageExample
//
//  Created by RealTime on 09/09/2013.
//  Copyright (c) 2013 RealTime. All rights reserved.
//

#import <UIKit/UIKit.h>

@class StorageRef;

@interface ViewController : UIViewController <UITableViewDataSource, UITableViewDelegate, UITextFieldDelegate>{
    NSString *listName;
    NSMutableDictionary *items;
    NSDictionary *lastSyncItems;	
    int selectAllAction; //0 - select all, 1 - unselect all
    bool isReconnecting;
    NSArray *timestampsToShow;
}

@property (nonatomic, strong) StorageRef *storage;

@property (nonatomic, strong) IBOutlet UITableView *todoTableView;
@property (nonatomic, strong) IBOutlet UITextField *tfListName;
@property (nonatomic, strong) IBOutlet UITextField *tfTodo;
@property (nonatomic, strong) IBOutlet UISegmentedControl *scFilter;

- (IBAction) checkAll:(id)sender;
- (IBAction) onFilterChange:(id)sender;

@end
