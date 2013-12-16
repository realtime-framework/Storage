//
//  StorageManager.h
//  RTCS Chat
//
//  Created by iOSdev on 11/7/13.
//  Copyright (c) 2013 Realtime.co. All rights reserved.
//

//  Structure of storage table:
//  - ChatRoom(name)    (NSString)  - primary key
//  - timeStamp         (NSString)  - secondary key
//  - nickName          (NSString)  - nick name of user who sends the message
//  - message           (NSString)  - message sent
//  - date              (NSString)  - local date of message sent


#import <Foundation/Foundation.h>
#import <RealTimeCloudStorage/RealTimeCloudStorage.h>


#warning SET CONSTANTS WITH YOUR REALTIME.CO APPLICATION DATA

#define AUTH_TOKEN @"__AUTH_TOKEN__"
#define APP_KEY @"__YOUR_APP_KEY__"
//___________________________________________________________

#define TABNAME @"RTCSChat"
#define PRIMARY_KEY @"ChatRoom"
#define SECONDARY_KEY @"timeStamp"

#define NICKNAME_KEY @"CHAT_NICKNAME"
#define CHATROOMS_KEY @"StorageChatRooms"


// The delegate protocol for Storage
@protocol ChatRoomDelegate <NSObject>

- (void) receivedMessage:(NSDictionary *) message OnChatRoom:(NSString *) chatRoom;
- (void) deleteMessage:(NSDictionary *) message OnChatRoom:(NSString *) chatRoom;
- (void) refreshChatRoom;
    
@end


@interface StorageManager : NSObject

@property (nonatomic, strong) StorageRef *storageRef;
@property (nonatomic, strong) TableRef *tableRef;
@property (strong, nonatomic) id<ChatRoomDelegate> chatDelegate;
@property (strong, nonatomic) NSString *nickName;
@property (strong, nonatomic) NSMutableArray *chatRooms;
@property (strong, nonatomic) NSMutableDictionary *unreadMsgsToChatRooms;

+ (StorageManager *) sharedManager;

- (id) initWithUserData;
- (void) saveNickName:(NSString *) nickName;
- (void) saveChatRooms;

- (void) addChatRoom:(NSString *) chatRoom;
- (void) removeChatRoom:(NSString *) chatRoom;


- (void) onNewItem:(ItemSnapshot *) tableItem;
- (void) onDeleteItem:(ItemSnapshot *) tableItem;

@end
