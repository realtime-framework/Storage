//
//  StorageManager.h
//  BirdGame
//
//  Created by iOSdev on 12/30/13.
//  Copyright (c) 2013 Apportable. All rights reserved.
//

//  Structure of storage table - StorageGames (game score by gameName):
//  - gameName		(NSString) - primary key
//  - score			(Number)   - secondary key
//  - nickName		(NSString) - nickname of the player with highScore
//  - gameID		(NSString) -


//  Structure of storage table - BirdGame (bird game scores by game id):
//  - gameID		(NSString) - primary key
//  - score			(Number)   - secondary key
//  - nickName		(NSString) - nickname of the player with highScore


//  Structure of storage table - BirdGameOpponent (bird game ID has opponent):
//  - gameID		(NSString) - primary key
//  - opponent		(Number)   - 1 or 0 if opponent exists




#warning SET CONSTANTS WITH YOUR REALTIME.CO APPLICATION DATA

/*
#define SERVER @"http://ortc-developers.realtime.co/server/2.1"
#define AUTH_TOKEN @"__AUTH_TOKEN__"
#define APP_KEY @"__YOUR_APPLICATION_KEY__"
#define CONNECTION_METADATA @"__CONNECTION_METADATA__"
#define ISCLUSTER 1
*/


#define SERVER @"http://ortc-developers.realtime.co/server/2.1"
#define AUTH_TOKEN @"St_Game"
#define APP_KEY @"S3XW2w"

#define CONNECTION_METADATA @"__CONNECTION_METADATA__"
#define ISCLUSTER 1

//___________________________________________________________
#define TAB_GAMES_SCORES @"StorageGames"
#define PKEY_GAMES @"gameName"
#define PKEY_GAMES_VALUE @"BirdGame"
#define SKEY_GAMES @"score"

#define TAB_BIRDGAME_SCORES @"BirdGame"
#define PKEY_BIRDGAME @"gameID"
#define SKEY_BIRDGAME @"score"

#define TAB_BIRDGAME_OPPONENT @"BirdGameOpponent"
#define PKEY_BIRDGAME_OPPONENT @"gameID"
#define KEY_BIRDGAME_OPPONENT @"opponent"
//___________________________________________________________
#define GAME_ID_KEY @"GAME_ID"
#define NICKNAME_KEY @"MY_NICKNAME"


#import <Foundation/Foundation.h>
#import <RealTimeCloudStorage/RealTimeCloudStorage.h>

@interface StorageManager : NSObject

@property (nonatomic, strong) StorageRef *storageRef;
@property (nonatomic, strong) NSString *myGameID;
@property (nonatomic, strong) NSString *gameID;
@property (nonatomic, strong) NSString *myNickName;
@property (nonatomic, readwrite) BOOL kickOut;



+ (StorageManager *) sharedManager;

- (id) initWithUserData;
- (void) generateGameID :(void (^)(BOOL finished)) completion;
- (void) checkGameIdOnTable:(NSString *) gameID createIT:(BOOL) createGameID completion:(void (^)(BOOL finished)) completion;
- (void) validateGameID:(NSString *) gameID onCompletion:(void (^)(BOOL finished)) completion;

- (void) setGameIdOpponent:(NSString *) oppGameID OnTable:(BOOL) isGameOpponent;
- (void) checkGameIdOpponent:(NSString *) checkGameID OnTableOnCompletion:(void (^)(BOOL finished)) completion;

/*
- (void) onNewItem:(ItemSnapshot *) tableItem;
- (void) onDeleteItem:(ItemSnapshot *) tableItem;
*/
- (void) onUpdateItem:(ItemSnapshot *) tableItem;

- (NSString *) generateRandomGameID_fourChars;


@end

