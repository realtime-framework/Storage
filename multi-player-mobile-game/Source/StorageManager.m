//
//  StorageManager.m
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
        
        _myGameID = [[NSString alloc] init];
		_gameID = [[NSString alloc] init];
		_myNickName = [[NSString alloc] init];
        
        [self setUserData];
    }
    return self;
}


- (void) setUserData {
	
	_storageRef = [[StorageRef alloc] init:APP_KEY privateKey:nil authenticationToken:AUTH_TOKEN];
	
    [_storageRef onReconnected:^(StorageRef *storage){
        NSLog(@" - StorageRef onReconnected");
    }];
	
	_myNickName = [[NSUserDefaults standardUserDefaults] objectForKey:NICKNAME_KEY];
	
	NSString *savedGameID = [[NSUserDefaults standardUserDefaults] objectForKey:GAME_ID_KEY];
    if (savedGameID != nil) {
        _myGameID = savedGameID;
		[[[_storageRef table:TAB_BIRDGAME_OPPONENT] item:_myGameID] on:StorageEvent_UPDATE objectToNotify:self selectorToPerform:@selector(onUpdateItem:)];
    }
    else {
		[self generateGameID:^(BOOL finished) {
			// if completion block defined, call it
			if (finished) {
				[[NSNotificationCenter defaultCenter] postNotificationName:@"myGameID" object:nil];
			}
		}];
	}
}


- (void) setMyNickName:(NSString *)myNickName {
	
	_myNickName = myNickName;
	[[NSUserDefaults standardUserDefaults] setObject:myNickName forKey:NICKNAME_KEY];
	[[NSUserDefaults standardUserDefaults] synchronize];
}


- (void) generateGameID:(void (^)(BOOL finished)) completion {
	
	[self checkGameIdOnTable:[self generateRandomGameID_fourChars] createIT:YES completion:^(BOOL finished) {
		// if completion block defined, call it
		if (!finished) {
			[self generateGameID:^(BOOL finished) {
				if (completion) {
					completion (finished);
				}
			}];
		}
		else if (completion) {
			completion (finished);
		}
	}];
}


- (void) validateGameID:(NSString *) gameID onCompletion:(void (^)(BOOL finished)) completion {
	[self checkGameIdOnTable:gameID createIT:NO completion:completion];
}


- (NSString *) generateRandomGameID_fourChars {
	
	NSString *letters = @"abcdefghijklmnopqrstuvwxyz";
	int numChars = 3;
    NSMutableString *randomString = [NSMutableString stringWithCapacity: numChars];
	
	[randomString appendFormat: @"%@", [[NSString stringWithFormat:@"%C", [letters characterAtIndex:arc4random() % [letters length]]] capitalizedString]];
	
    for (int i = 0; i < numChars; i++) {
		[randomString appendFormat: @"%C", [letters characterAtIndex: arc4random() % [letters length]]];
    }
	NSLog(@"\n\n\n RandomGameID_fourChars: %@\n",randomString);
	return randomString;
}


- (void) checkGameIdOnTable:(NSString *) gameID createIT:(BOOL) createGameID completion:(void (^)(BOOL finished)) completion {
	
	__block BOOL gameIdExists = NO;
	void (^cbSuccess)(ItemSnapshot*) = ^(ItemSnapshot *item) {//define block for a success callback
        
		if(item!=nil) {
			NSDictionary *dic = [item val];
			//NSLog(@"dic: %@", dic);
			
			if ([gameID isEqualToString:[dic objectForKey:PKEY_BIRDGAME]]) {
				gameIdExists = YES;
			}
		}
        else {
            //we got all items
			if (gameIdExists && createGameID) {
				completion(NO);
			}
			else if (createGameID) {
				
				_myGameID = gameID;
				NSDictionary *newItem = [[NSDictionary alloc] initWithObjectsAndKeys:gameID, PKEY_BIRDGAME, [NSNumber numberWithInt:-1], SKEY_BIRDGAME, nil];
				[[_storageRef table:TAB_BIRDGAME_SCORES] push:newItem
													  success:^(ItemSnapshot *item) {
														  
														  NSLog(@"Item:\n%@\nWrite Successfully", [item val]);
														  
														  [[NSUserDefaults standardUserDefaults] setObject:_myGameID forKey:GAME_ID_KEY];
														  [[NSUserDefaults standardUserDefaults] synchronize];
														  
														  NSDictionary *itemPush = [[NSDictionary alloc] initWithObjectsAndKeys:_myGameID, PKEY_BIRDGAME_OPPONENT, [NSNumber numberWithInt:0], KEY_BIRDGAME_OPPONENT, nil];
														  [[_storageRef table:TAB_BIRDGAME_OPPONENT] push:itemPush
																								  success:^(ItemSnapshot *item) {
																									  
																									  if(item!=nil) {
																										  NSDictionary *dic = [item val];
																										  
																										  NSLog(@"Item:\n%@\nWrite Successfully", [item val]);
																										  
																										  [[[_storageRef table:TAB_BIRDGAME_OPPONENT] item:[dic objectForKey:PKEY_BIRDGAME_OPPONENT]] on:StorageEvent_UPDATE objectToNotify:self selectorToPerform:@selector(onUpdateItem:)];
																									  }
																								  }
																									error:^(NSError *error) {
																										NSLog(@"Error Writing item\nERROR: %@", [error description]);
																									}];
														  
														  completion(YES);
													  }
														error:^(NSError *error) {
															NSLog(@"Error Writing item\nERROR: %@", [error description]);
															completion(NO);
														}];
			}
			else if (!createGameID) {
				completion(gameIdExists);
			}
		}
    };
	
	void (^cbError)(NSError*) = ^(NSError* e){ //define block for an error callback
        NSLog(@"### Error: %@", [e localizedDescription]);
    };
	
	TableRef *tableRef = [_storageRef table:TAB_BIRDGAME_SCORES];
	[tableRef getItems:cbSuccess error:cbError];
}

- (void) setGameIdOpponent:(NSString *) oppGameID OnTable:(BOOL) isGameOpponent {
	
	NSDictionary *newItem = [[NSDictionary alloc] initWithObjectsAndKeys:[NSNumber numberWithInt:isGameOpponent], KEY_BIRDGAME_OPPONENT, nil];
	
	[[[_storageRef table:TAB_BIRDGAME_OPPONENT] item:oppGameID]
	 set:newItem
	 success:^(ItemSnapshot *item) {
		 if(item!=nil) {
			 NSLog(@"Item:\n%@\nUpdated Successfully", [item val]);
		 }
		 else {
			 NSDictionary *itemPush = [[NSDictionary alloc] initWithObjectsAndKeys:oppGameID, PKEY_BIRDGAME_OPPONENT, [NSNumber numberWithInt:isGameOpponent], KEY_BIRDGAME_OPPONENT, nil];
			 [[_storageRef table:TAB_BIRDGAME_OPPONENT] push:itemPush
													 success:^(ItemSnapshot *item) {
														 if(item!=nil) {
															 NSLog(@"Item:\n%@\nWrite Successfully", [item val]);
														 }
													 }
													   error:^(NSError *error) {
														   NSLog(@"Error Writing item\nERROR: %@", [error description]);
													   }];
		 }
	 }
	 error:^(NSError *error) {
		 NSLog(@"Error on updating item\nERROR: %@", [error description]);
	 }];
}


- (void) checkGameIdOpponent:(NSString *) checkGameID OnTableOnCompletion:(void (^)(BOOL finished)) completion {
	
	[[[_storageRef table:TAB_BIRDGAME_OPPONENT] item:checkGameID]
	 get:^(ItemSnapshot *item) {
		 
		 if(item!=nil) {
			 completion ([[[item val] objectForKey:KEY_BIRDGAME_OPPONENT] boolValue]);
		 }
		 else {
			 UIAlertView *alertView = [[UIAlertView alloc] initWithTitle:@"Sorry!" message:@"It seems that occurred some trouble getting your opponent. Try Later!" delegate:nil cancelButtonTitle:@"Ok" otherButtonTitles:nil];
			 [alertView show];
		 }
	 }
	 error:^(NSError *error) {
		 NSLog(@"Error on getting item\nERROR: %@", [error description]);
	 }];
}



/*
- (void) onNewItem:(ItemSnapshot *) tableItem {
 
    NSDictionary* itemDic = [tableItem val];
    NSLog(@"onNewItem:\n%@", itemDic);
}

- (void) onDeleteItem:(ItemSnapshot *) tableItem {
    
    NSDictionary* itemDic = [tableItem val];
    NSLog(@"onDeleteItem:\n%@", itemDic);
}
*/

- (void) onUpdateItem:(ItemSnapshot *) tableItem {
	
	NSDictionary* itemDic = [tableItem val];
	//NSLog(@"onUpdateItem:\n%@", itemDic);
	[[NSNotificationCenter defaultCenter] postNotificationName:@"gameHasOpponent" object:nil userInfo:itemDic];
}



@end
