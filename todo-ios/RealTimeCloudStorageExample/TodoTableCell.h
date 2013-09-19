//
//  TodoTableCell.h
//  StorageExample
//
//  Created by RealTime on 09/09/2013.
//  Copyright (c) 2013 RealTime. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface TodoTableCell : UITableViewCell

@property (nonatomic, strong) IBOutlet UILabel *cellLabel;
@property (nonatomic, strong) IBOutlet UIImageView *imgCheck;
@property (nonatomic, strong) IBOutlet UIButton *imgButton;
@property (nonatomic, strong) IBOutlet UIButton *delButton;

- (IBAction) activityChange:(id)sender;

@end
