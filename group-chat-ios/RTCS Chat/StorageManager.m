 //
//  StorageManager.m
//  RTCS Chat
//
//  Created by iOSdev on 11/7/13.
//  Copyright (c) 2013 Realtime.co. All rights reserved.
//

//  Structure of storage table:
//  - ChatRoom(name)    (NSString)  - primary key
//  - timeStamp         (NSNumber)  - secondary key
//  - nickName          (NSString)  - nick name of user who sends the message
//  - message           (NSString)  - message sent
//  - date              (NSString)  - local date of message sent


#import "StorageManager.h"

@implementation StorageManager

+ (StorageManager *) sharedManager
{
    static dispatch_once_t pred;
    static StorageManager *sharedInstance = nil;
    dispatch_once(&pred, ^{
        sharedInstance = [[StorageManager alloc] initWithUserData];
    });
    return sharedInstance;
}


- (id) initWithUserData {
    
    self = [super init];
    if (self) {
        
        _nickName = [[NSString alloc] init];
        _chatRooms = [[NSMutableArray alloc] init];
        _unreadMsgsToChatRooms = [[NSMutableDictionary alloc] init];
        
        [self setUserData];
    }
    return self;
}


- (void) setUserData {
    
    NSString *nickName = [[NSUserDefaults standardUserDefaults] objectForKey:NICKNAME_KEY];
    if (nickName != nil) {
        _nickName = [[NSUserDefaults standardUserDefaults] objectForKey:NICKNAME_KEY];
    }
    else {
        _nickName = @"";
    }
    _chatRooms = [[NSMutableArray alloc] initWithArray:[[NSUserDefaults standardUserDefaults] objectForKey:CHATROOMS_KEY]];
    
    _storageRef = [[StorageRef alloc] init:APP_KEY privateKey:nil authenticationToken:AUTH_TOKEN];
    [_storageRef onReconnected:^(StorageRef *storage){
        //NSLog(@" - StorageRef onReconnected");
        [self.chatDelegate refreshChatRoom];
    }];
	
	_tableRef = [_storageRef table:TABNAME];
	
	for (NSString *chatRoom in _chatRooms) {
		[self addChatRoom:chatRoom];
	}
}


- (void) saveNickName:(NSString *) nickName {
    
    _nickName = nickName;
    [[NSUserDefaults standardUserDefaults] setObject:_nickName forKey:NICKNAME_KEY];
    [[NSUserDefaults standardUserDefaults] synchronize];
}

- (void) saveChatRooms {
    
    [[NSUserDefaults standardUserDefaults] setObject:_chatRooms forKey:CHATROOMS_KEY];
    [[NSUserDefaults standardUserDefaults] synchronize];
}


- (void) addChatRoom:(NSString *) chatRoom {
    
    BOOL addChatRoom = YES;
    for (NSString *ch in _chatRooms) {
        if ([chatRoom isEqualToString:ch]) {
            addChatRoom = NO;
            break;
        }
    }
    if (addChatRoom && chatRoom != nil && [chatRoom length] > 0) {
        
        [_chatRooms insertObject:chatRoom atIndex:[_chatRooms count]];
        [self saveChatRooms];
    }
	
	// set actions to be perform for events: put, delete and (update)
	// enable Push Notifications
	
	//[[_tableRef item:chatRoom] enablePushNotifications];
	[[[_tableRef item:chatRoom] enablePushNotifications] on:StorageEvent_PUT objectToNotify:self selectorToPerform:@selector(onNewItem:)];
	[[_tableRef item:chatRoom] on:StorageEvent_DELETE objectToNotify:self selectorToPerform:@selector(onDeleteItem:)];
	//[[_tableRef item:chatRoom] on:StorageEvent_UPDATE objectToNotify:self selectorToPerform:@selector(onUpdateItem:)];
}

- (void) removeChatRoom:(NSString *) chatRoom {
    
    for (int i = 0; i < [_chatRooms count]; i++) {
        if ([[_chatRooms objectAtIndex:i] isEqualToString:chatRoom]) {
            [_chatRooms removeObjectAtIndex:i];
            break;
        }
    }
    [self saveChatRooms];
	
	//remove listeners for Chat Room
	[[_tableRef item:chatRoom] off:StorageEvent_PUT objectToNotify:self selectorToPerform:@selector(onNewItem:)];
	[[_tableRef item:chatRoom] off:StorageEvent_DELETE objectToNotify:self selectorToPerform:@selector(onDeleteItem:)];
	//[[_tableRef item:chatRoom] off:StorageEvent_UPDATE objectToNotify:self selectorToPerform:@selector(onUpdateItem:)];
	
}

- (void) onNewItem:(ItemSnapshot *) tableItem {
    
    NSDictionary* itemDic = [tableItem val];
    NSLog(@"onNewItem:\n%@", itemDic);
    [self.chatDelegate receivedMessage:itemDic OnChatRoom:[itemDic objectForKey:PRIMARY_KEY]];
}

- (void) onDeleteItem:(ItemSnapshot *) tableItem {
    
    NSDictionary* itemDic = [tableItem val];
    NSLog(@"onDeleteItem:\n%@", itemDic);
    [self.chatDelegate deleteMessage:itemDic OnChatRoom:[itemDic objectForKey:PRIMARY_KEY]];
}

/*
- (void) onUpdateItem:(ItemSnapshot *) tableItem {
    
    NSDictionary* itemDic = [tableItem val];
    NSLog(@"onUpdateItem: %@", itemDic);
}
*/


@end
