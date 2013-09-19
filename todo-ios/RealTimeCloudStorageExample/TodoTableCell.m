//
//  TodoTableCell.m
//  StorageExample
//
//  Created by RealTime on 09/09/2013.
//  Copyright (c) 2013 RealTime. All rights reserved.
//

#import "TodoTableCell.h"

@implementation TodoTableCell

@synthesize cellLabel;
@synthesize imgCheck;
@synthesize imgButton;

- (id)initWithStyle:(UITableViewCellStyle)style reuseIdentifier:(NSString *)reuseIdentifier
{
    self = [super initWithStyle:style reuseIdentifier:reuseIdentifier];
    if (self) {
        // Initialization code
    }
    return self;
}

- (void)setSelected:(BOOL)selected animated:(BOOL)animated
{
    [super setSelected:selected animated:animated];

    // Configure the view for the selected state
}

- (IBAction) activityChange:(id)sender{
    NSLog(@"aChange");
}

@end
