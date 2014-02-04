//
//  MessagingManager.h
//  BirdGame
//
//  Created by iOSdev on 1/13/14.
//  Copyright (c) 2014 Apportable. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "OrtcClient.h"
#import "StorageManager.h"


// The delegate protocol for the Messaging
@protocol MessagingDelegate <NSObject>

- (void) receivedMSG:(NSString *) message onChannel:(NSString *) channel;

@end


@interface MessagingManager : NSObject <OrtcClientDelegate> {
	
	void (^onMessage)(OrtcClient* ortc, NSString* channel, NSString* message);
}

+ (MessagingManager *) sharedManager;

@property (retain, nonatomic) id <MessagingDelegate> msgDelegate;
@property (strong, nonatomic) OrtcClient *messagingClient;


- (void) sendMessage:(NSString *)msg ToChannel:(NSString *) channel;
- (void) subscribeChannelWithName:(NSString *) channelName ;
- (void) unSubscribeChannelWithName:(NSString *) channelName;



@end