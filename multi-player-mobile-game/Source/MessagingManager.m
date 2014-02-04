//
//  MessagingManager.m
//  BirdGame
//
//  Created by iOSdev on 1/13/14.
//  Copyright (c) 2014 Apportable. All rights reserved.
//

#import "MessagingManager.h"

@implementation MessagingManager


+ (MessagingManager *) sharedManager
{
    static dispatch_once_t pred;
    static MessagingManager *sharedInstance = nil;
    dispatch_once(&pred, ^{
        sharedInstance = [[MessagingManager alloc] init];
    });
    return sharedInstance;
}

- (id)init
{
    self = [super init];
    if (self) {
		
		id weakSelf = self;
		onMessage = ^(OrtcClient* ortc, NSString* channel, NSString* message) {
			[weakSelf receivedMSG:message onChannel:channel];
		};
		
		_messagingClient = [OrtcClient ortcClientWithConfig:self];
		if (!_messagingClient.isConnected) {
			[self connectMessaging];
		}
    }
    return self;
}


#pragma mark MESSAGING

- (void) connectMessaging {
    
    [_messagingClient setConnectionMetadata:CONNECTION_METADATA];
    [_messagingClient setConnectionTimeout:10];
    
    if (ISCLUSTER) {
        [_messagingClient setClusterUrl:SERVER];
    }
    else {
        [_messagingClient setUrl:SERVER];
    }
	
	NSLog(@"Connecting to: %@", SERVER);
    [_messagingClient connect:APP_KEY authenticationToken:AUTH_TOKEN];
}


- (void) sendMessage:(NSString *)msg ToChannel:(NSString *) channel
{
	
	[_messagingClient send:channel message:msg];
}


- (void) subscribeChannelWithName:(NSString *) channelName {
    
    NSNumber *result = [_messagingClient isSubscribed:channelName];
    if (result == [NSNumber numberWithBool:YES]) {
        
        NSLog(@"YES, already subscribed to %@", channelName);
    }
    else if (result == [NSNumber numberWithBool:NO]) {
        
        NSLog(@"NOT subscribed to %@", channelName);
        
        id weakSelf = self;
        
        onMessage = ^(OrtcClient* ortc, NSString* channel, NSString* message) {
            [weakSelf receivedMSG:message onChannel:channel];
        };
        
        [_messagingClient subscribe:channelName subscribeOnReconnected:YES onMessage:onMessage];
        //[_messagingClient subscribeWithNotifications:channelName subscribeOnReconnected:YES onMessage:onMessage];
    }
}

- (void) unSubscribeChannelWithName:(NSString *) channelName {
    
    [_messagingClient unsubscribe:channelName];
}


#pragma mark ORTC Delegation

- (void) onConnected:(OrtcClient *) ortc
{
	NSLog(@"Connected to: %@", ortc.url);
	NSLog(@"Session Id: %@", ortc.sessionId);
	
	[_messagingClient subscribe:[[StorageManager sharedManager] myGameID] subscribeOnReconnected:YES onMessage:onMessage];
	
	NSString *myGameNotificationsChannel = [NSString stringWithFormat:@"%@:Notifications", [[StorageManager sharedManager] myGameID]];
	[_messagingClient subscribeWithNotifications:myGameNotificationsChannel subscribeOnReconnected:YES onMessage:onMessage];
}

- (void) onDisconnected:(OrtcClient *) ortc
{
	NSLog(@"Disconnected");
}

- (void) onReconnecting:(OrtcClient *) ortc
{
	NSLog(@"Reconnecting to: %@", ortc.url);
}

- (void) onReconnected:(OrtcClient *) ortc
{
    NSLog(@"Reconnected to: %@", ortc.url);
}

- (void) onSubscribed:(OrtcClient *) ortc channel:(NSString*) channel
{
	NSLog(@"Subscribed to: %@", channel);
}

- (void) onUnsubscribed:(OrtcClient *) ortc channel:(NSString*) channel
{
    NSLog(@"Unsubscribed from: %@", channel);
}

- (void) onException:(OrtcClient *) ortc error:(NSError*) error
{
    NSLog(@"Exception [Code:%d]: %@", [error code], error.localizedDescription);
    
    if ([error code] != 1) {
        
        NSString *msg = [NSString stringWithFormat:@"It has occurred a problem!\nException: %@", error.localizedDescription];
        UIAlertView *alert = [[UIAlertView alloc] initWithTitle:@"" message:msg delegate:nil cancelButtonTitle:@"OK" otherButtonTitles:nil];
        [alert show];
    }
}


#pragma mark - ORTC methods


- (void) receivedMSG:(NSString *) message onChannel:(NSString *) channel {
	
	if (_msgDelegate && [_msgDelegate respondsToSelector:@selector(receivedMSG:onChannel:)]) {
		[_msgDelegate receivedMSG:message onChannel:channel];
	}
}

@end

