//
//  RealtimeCloudStorage.h
//  RealtimeCloudStorage
//
//	Version 1.0.2
//
//  Created by Realtime on 15/01/2014.
//  Copyright (c) 2013 RealTime. All rights reserved.
//

/**
 * @mainpage
 *
 * Real Time Cloud Storage is an on cloud key-value storage service with realtime notifications.
 * 
 * This is a documentation for Real Time Cloud Storage iOS Framework
 *
 * In order to use this framework in your Xcode project, choose Project > Add to Project and select the framework directory.
 * Your application must be linked against the following frameworks/dylibs
 *
 * - libicucore.dylib
 * - CFNetwork.framework
 * - Security.framework
 * - Foundation.framework
 *
 * Also you will have to add a flag to your project: '-all_load' in "Other Linker Flags" under build settings for your project (Linking section)
 *
 */

#import <Foundation/Foundation.h>
#import "RealtimePushAppDelegate.h"

@class TableRef;
@class TableSnapshot;
@class ItemRef;
@class ItemSnapshot;
@class StorageContext;

/**
Provision Load Type
 
- ProvisionLoad_READ: Assign more read capacity than write capacity.
- ProvisionLoad_WRITE: Assign more write capacity than read capacity.
- ProvisionLoad_BALANCED: Assign similar read an write capacity.
*/
typedef NS_ENUM(NSInteger, ProvisionLoad) {
    ProvisionLoad_READ = 1, ProvisionLoad_WRITE = 2, ProvisionLoad_BALANCED = 3
};

/**
Provision Load Type

- ProvisionType_LIGHT: 26 operations per second.
- ProvisionType_MEDIUM: 50 operations per second.
- ProvisionType_INTERMEDIATE: 100 operations per second.
- ProvisionType_HEAVY: 200 operations per second.
- ProvisionType_CUSTOM: customised read and write throughput.
*/
typedef NS_ENUM(NSInteger, ProvisionType) {
    ProvisionType_LIGHT = 1, ProvisionType_MEDIUM = 2, ProvisionType_INTERMEDIATE = 3, ProvisionType_HEAVY = 4, ProvisionType_CUSTOM = 5
};


typedef NS_ENUM(NSInteger, StorageDataType) {
    StorageDataType_STRING, StorageDataType_NUMBER
};

typedef NS_ENUM(NSInteger, StorageEventType) {
    StorageEvent_PUT, StorageEvent_UPDATE, StorageEvent_DELETE
};

typedef enum StorageOrder:NSInteger {StorageOrder_NULL, StorageOrder_ASC, StorageOrder_DESC} StorageOrder;

//=========================================================


/**
 * StorageRef interface
 */
@interface StorageRef : NSObject

@property (nonatomic, retain) StorageContext *context;

/** Initialise the Storage Reference. Should be the first thing to do.

@param applicationKey The application key.
@param privateKey The application key.
@param authenticationToken The authentication token.
*/
- (id) init:(NSString*) aApplicationKey privateKey:(NSString*) aPrivateKey authenticationToken:(NSString*) aAuthenticationToken;

/**
 * Initialise the Storage Reference. Should be the first thing to do.
 *
 * @param applicationKey The application key.
 * @param privateKey The application key.
 * @param authenticationToken The authentication token.
 * @param isCluster Specifies if url is cluster.
 * @param isSecure Defines if connection use ssl.
 * @param url The url of the storage server.
 */
- (id) init:(NSString*) aApplicationKey privateKey:(NSString*) aPrivateKey authenticationToken:(NSString*) aAuthenticationToken isCluster:(Boolean) aIsCluster isSecure:(Boolean) aIsSecure url:(NSString*) aUrl;
/**
 * Retrieves a list of the names of all tables created by the user’s subscription.
 *
 * @param success The block object to call once the values are available. The function will be called with a table snapshot as argument, as many times as the number of tables existent.
 * @param error  The block object to call if an exception occurred. 
 */
- (StorageRef*) getTables: (void (^)(TableSnapshot *success)) aSuccessCallback error:(void (^)(NSError *error)) anErrorCallback;

/**
 * Checks if a specified authentication token is authenticated.
 *
 * @param authenticationToken The token to verify.
 * @param success The block object to call when the operation is completed.
 * @param error The block object to call if an exception occurred. 
 */
- (StorageRef*) isAuthenticated: (NSString*) aAuthenticationToken success:(void (^)(Boolean success)) aSuccessCallback error:(void (^)(NSError *error)) anErrorCallback;

/**
 * Creates new table reference
 *
 * @param name The table name
 */
- (TableRef*) table:(NSString*) aName;

/**
 * Bind a block object to be called whenever the connection reestablish.
 *
 * @param onReconnected The block object to call when the connection reestablish.
 */
- (StorageRef*) onReconnected: (void (^)(StorageRef* storage)) reconnectedCallback;


/**
 * Bind a block object to be called whenever the connection is lost.
 *
 * @param onReconnecting The block object to call when the connection is lost.
 */
- (StorageRef*) onReconnecting: (void (^)(StorageRef* storage)) reconnectingCallback;

/**
 * Activate offline buffering, which buffers item's modifications and applies them when connection reestablish.
 * The offline buffering is activated by default.
 */
- (StorageRef*) activateOfflineBuffering;

/**
 * Deactivate offline buffering, which buffers item's modifications and applies them when connection reestablish.
 * The offline buffering is activated by default. 
 */
- (StorageRef*) deactivateOfflineBuffering;

@end

//=========================================================


/**
 * TableRef interface
 */
@interface TableRef : NSObject{
    StorageContext *context;
    NSString* name;
    StorageOrder order;
    NSMutableArray *filterList;
    int limit;
}

- (id) initWithName:(NSString*)aName context:(StorageContext*)aContext;

/**
 * Define if the items are retrieved in ascendent order.
 */
- (TableRef*) asc;

/**
 * Define if the items are retrieved in descendent order.
 */
- (TableRef*) desc;

/**
 * Applies a filter to the table. Only objects with item that begins with the value will be in the scope. The item type is NSString.
 *
 * @param item The name of property to filter.
 * @param value The value of property to filter.
 */
- (TableRef*) beginsWithString: (NSString*) item value:(NSString*) value;

/**
 * Applies a filter to the table. Only objects with item that begins with the value will be in the scope. The item type is NSNumber.
 *
 * @param item The name of property to filter.
 * @param value The value of property to filter.
 */
- (TableRef*) beginsWithNumber: (NSString*) item value:(NSNumber*) value;

/**
 * Applies a filter to the table. Only objects with item that are in range between beginValue and endValue will be in the scope. The item type is NSString.
 *
 * @param item The name of property to filter.
 * @param beginValue The value of property indicates the beginning of range.
 * @param endValue The value of property indicates the end of range.
 */
- (TableRef*) betweenString: (NSString*) item beginValue:(NSString*) beginValue endValue:(NSString*) endValue;

/**
 * Applies a filter to the table. Only objects with item that are in range between beginValue and endValue will be in the scope. The item type is NSNumber.
 *
 * @param item The name of property to filter.
 * @param beginValue The value of property indicates the beginning of range.
 * @param endValue The value of property indicates the end of range.
 */
- (TableRef*) betweenNumber: (NSString*) item beginValue:(NSNumber*) beginValue endValue:(NSNumber*) endValue;

/**
 * Applies a filter to the table. Only objects with item that contains the filter value will be in the scope. The item type is NSString.
 *
 * @param item The name of property to filter.
 * @param value The value of property to filter.
 */
- (TableRef*) containsString: (NSString*) item value:(NSString*) value;

/**
 * Applies a filter to the table. Only objects with item that contains the filter value will be in the scope. The item type is NSNumber.
 *
 * @param item The name of property to filter.
 * @param value The value of property to filter.
 */
- (TableRef*) containsNumber: (NSString*) item value:(NSNumber*) value;

/**
 * Applies a filter to the table. Only objects with item that match the filter value will be in the scope. The item type is NSString.
 *
 * @param item The name of property to filter.
 * @param value The value of property to filter.
 */
- (TableRef*) equalsString: (NSString*) item value:(NSString*) value;

/**
 * Applies a filter to the table. Only objects with item that match the filter value will be in the scope. The item type is NSNumber.
 *
 * @param item The name of property to filter.
 * @param value The value of property to filter.
 */
- (TableRef*) equalsNumber: (NSString*) item value:(NSNumber*) value;

/**
 * Applies a filter to the table. Only objects with item greater or equal to filter value will be in the scope. The item type is NSString.
 *
 * @param item The name of property to filter.
 * @param value The value of property to filter.
 */
- (TableRef*) greaterEqualString: (NSString*) item value:(NSString*) value;

/**
 * Applies a filter to the table. Only objects with item greater or equal to filter value will be in the scope. The item type is NSNumber.
 *
 * @param item The name of property to filter.
 * @param value The value of property to filter.
 */
- (TableRef*) greaterEqualNumber: (NSString*) item value:(NSNumber*) value;

/**
 * Applies a filter to the table. Only objects with item greater than filter value will be in the scope. The item type is NSString.
 *
 * @param item The name of property to filter.
 * @param value The value of property to filter.
 */
- (TableRef*) greaterThanString: (NSString*) item value:(NSObject*) value;

/**
 * Applies a filter to the table. Only objects with item greater than filter value will be in the scope. The item type is NSNumber.
 *
 * @param item The name of property to filter.
 * @param value The value of property to filter.
 */
- (TableRef*) greaterThanNumber: (NSString*) item value:(NSNumber*) value;

/**
 * Applies a filter to the table. Only objects with item lesser or equal to filter value will be in the scope. The item type is NSString.
 *
 * @param item The name of property to filter.
 * @param value The value of property to filter.
 */
- (TableRef*) lesserEqualString: (NSString*) item value:(NSString*) value;

/**
 * Applies a filter to the table. Only objects with item lesser or equal to filter value will be in the scope. The item type is NSNumber.
 *
 * @param item The name of property to filter.
 * @param value The value of property to filter.
 */
- (TableRef*) lesserEqualNumber: (NSString*) item value:(NSNumber*) value;

/**
 * Applies a filter to the table. Only objects with item lesser than filter value will be in the scope. The item type is NSString.
 *
 * @param item The name of property to filter.
 * @param value The value of property to filter.
 */
- (TableRef*) lesserThanString: (NSString*) item value:(NSString*) value;

/**
 * Applies a filter to the table. Only objects with item lesser than filter value will be in the scope. The item type is NSNumber.
 *
 * @param item The name of property to filter.
 * @param value The value of property to filter.
 */
- (TableRef*) lesserThanNumber: (NSString*) item value:(NSNumber*) value;

/**
 * Applies a filter to the table. Only objects with item that does not contains the filter value will be in the scope. The item type is NSString.
 *
 * @param item The name of property to filter.
 * @param value The value of property to filter.
 */
- (TableRef*) notContainsString: (NSString*) item value:(NSString*) value;

/**
 * Applies a filter to the table. Only objects with item that does not contains the filter value will be in the scope. The item type is NSNumber.
 *
 * @param item The name of property to filter.
 * @param value The value of property to filter.
 */
- (TableRef*) notContainsNumber: (NSString*) item value:(NSNumber*) value;

/**
 * Applies a filter to the table. Only objects with item that does not match the filter value will be in the scope. The item type is NSString.
 *
 * @param item The name of property to filter.
 * @param value The value of property to filter.
 */
- (TableRef*) notEqualString: (NSString*) item value:(NSString*) value;

/**
 * Applies a filter to the table. Only objects with item that does not match the filter value will be in the scope. The item type is NSNumber.
 *
 * @param item The name of property to filter.
 * @param value The value of property to filter.
 */
- (TableRef*) notEqualNumber: (NSString*) item value:(NSNumber*) value;

/**
 * Applies a filter to the table. Only objects with item that is not null will be in the scope.
 *
 * @param item The name of property to filter.
 * @param value The value of property to filter.
 */
- (TableRef*) notNull: (NSString*) item;

/**
 * Applies a filter to the table. Only objects with item that is null will be in the scope.
 *
 * @param item The name of property to filter.
 * @param value The value of property to filter.
 */
- (TableRef*) null: (NSString*) item;


/**
 * Adds a new table with primary key to the user's application. Take into account that, even though this operation completes, the table stays in a ‘creating’ state. While in this state, all operations done over this table will fail with a ResourceInUseException.
 *
 * @param primaryKey The primary key
 * @param primaryKeyDataType The primary key data type (<StorageDataType>: StorageDataType_STRING or StorageDataType_NUMBER)
 * @param provisionType The <ProvisionType> (ProvisionType_LIGHT, ProvisionType_MEDIUM, ProvisionType_INTERMEDIATE, ProvisionType_HEAVY or ProvisionType_CUSTOM)
 * @param provisionLoad The <ProvisionLoad> (ProvisionLoad_READ, ProvisionLoad_WRITE or ProvisionLoad_BALANCED)
 * @param success The block object to call when the operation is completed.
 * @param error The block object to call if an exception occurred.
 */
- (TableRef*) create: (NSString*)aPrimaryKey primaryKeyDataType:(StorageDataType)aPrimaryKeyDataType provisionType:(ProvisionType)aProvisionType provisionLoad:(ProvisionLoad)aProvisionLoad success:(void (^)(NSDictionary*)) aSuccessCallback error:(void (^)(NSError *error)) anErrorCallback;

/**
 * Adds a new table with primary and secondary keys  to the user's application. Take into account that, even though this operation completes, the table stays in a ‘creating’ state. While in this state, all operations done over this table will fail with a ResourceInUseException.
 *
 * @param primaryKey The primary key
 * @param primaryKeyDataType The primary key data type (<StorageDataType>: StorageDataType_STRING or StorageDataType_NUMBER)
 * @param secondaryKey The secondary key
 * @param secondaryKeyDataType The secondary key data type (<StorageDataType>: STRING or NUMBER)
 * @param provisionType The <ProvisionType> (ProvisionType_LIGHT, ProvisionType_MEDIUM, ProvisionType_INTERMEDIATE, ProvisionType_HEAVY or ProvisionType_CUSTOM)
 * @param provisionLoad The <ProvisionLoad> (ProvisionLoad_READ, ProvisionLoad_WRITE or ProvisionLoad_BALANCED)
 * @param success The block object to call when the operation is completed.
 * @param error The block object to call if an exception occurred.
 */
- (TableRef*) create: (NSString*) aPrimaryKey primaryKeyDataType:(StorageDataType) aPrimaryKeyDataType secondaryKey:(NSString*) aSecondaryKey secondaryKeyDataType:(StorageDataType) aSecondaryKeyDataType provisionType:(ProvisionType) aProvisionType provisionLoad:(ProvisionLoad)aProvisionLoad success:(void (^)(NSDictionary*)) aSuccessCallback error:(void (^)(NSError *error)) anErrorCallback;

/**
 * Deletes a table and all of its items.
 *
 * @param success The block object to call when the operation is completed.
 * @param error The block object to call if an exception occurred.
 */ 
- (void) del: (void (^)(Boolean)) aSuccessCallback error:(void (^)(NSError *error)) anErrorCallback;

/**
 * Updates the number of operations per second and how they're distributed between read and write operations of a given table. Take into account that, even though this operation completes, the table stays in a ‘updating’ state. While in this state, all operations done over this table will fail with a ResourceInUseException.
 *
 * @param provisionType The <ProvisionType> (ProvisionType_LIGHT, ProvisionType_MEDIUM, ProvisionType_INTERMEDIATE, ProvisionType_HEAVY or ProvisionType_CUSTOM)
 * @param provisionLoad The <ProvisionLoad> (ProvisionLoad_READ, ProvisionLoad_WRITE or ProvisionLoad_BALANCED)
 * @param success The block object to call when the operation is completed.
 * @param error The block object to call if an exception occurred.
 */
- (TableRef*) update: (ProvisionType) aProvisionType provisionLoad:(ProvisionLoad) aProvisionLoad success:(void (^)(NSDictionary*)) aSuccessCallback error:(void (^)(NSError*)) anErrorCallback;

/**
 * Retrieves the reference to the item matching the given key. (in case that table was created only with primary key)
 *
 * @param primaryKey The primary key (If the primary key type is NSNumber you have to convert it to NSString)
 */
- (ItemRef*) item: (NSString*) primaryKey;

/**
 * Retrieves the reference to the item matching the given pair of keys.
 *
 * @param primaryKey The primary key (If the primary key type is NSNumber you have to convert it to NSString)
 * @param secondaryKey The secondary key (If the primary key type is NSNumber you have to convert it to NSString)
 */
- (ItemRef*) item: (NSString*) primaryKey secondaryKey:(NSString*) secondaryKey;

/**
 * Stores an item in a table.
 * 
 * @param item The item to be stored (must contains primary key and secondary key if such exists)
 * @param success The block object to call when the operation is completed.
 * @param error The block object to call if an exception occurred.
 */
- (TableRef*) push: (NSDictionary*) aItem success:(void (^)(ItemSnapshot*)) aSuccessCallback error:(void (^)(NSError*)) anErrorCallback;

/**
 * Get the items of this table applying the filters if defined before, if not retrieves all items.
 *
 * @param success The block object called for every item retrieved. The last call have nil as a parameter.
 * @param error The block object to call if an exception occurred.
 */
- (TableRef*) getItems: (void (^)(ItemSnapshot *item)) aSuccessCallback error:(void (^)(NSError*)) anErrorCallback;

/**
 * Applies a limit to this table reference confining the number of items to get.
 * @param limit The limit to apply.
 */
- (TableRef*) limit: (int) value;

/**
 * Retrieves information about the table, including the current status of the table, the primary key schema and date of creation.
 *
 * @param success The block object to call when the operation is completed.
 * @param error The block object to call if an exception occurred.
 */
- (TableRef*) meta: (void (^)(NSDictionary*)) aSuccessCallback error:(void (^)(NSError*)) anErrorCallback;

/**
 * Return the name of the referred table.
 */
- (NSString*) name;

/**
 * Attach a listener to run block object every time the event type occurs.
 *
 * @param eventType The type of the event to listen (<StorageEventType>: StorageEvent_PUT, StorageEvent_UPDATE or StorageEvent_DELETE)
 * @param callback The block object which is called with the snapshot of affected item as an argument.
 */
- (TableRef*) on: (StorageEventType) eventType callback:(void (^)(ItemSnapshot *item)) callback;

/**
 * Attach a listener to perform a selector of specified object every time the event type occurs.
 *
 * @param eventType The type of the event to listen (<StorageEventType>: StorageEvent_PUT, StorageEvent_UPDATE or StorageEvent_DELETE)
 * @param objectToNotify The object to be notify.
 * @param selectorToPerform The selector of objectToNotify which is called with the snapshot of affected item as an argument.
 */
- (TableRef*) on: (StorageEventType) eventType objectToNotify:(id)anObject selectorToPerform:(SEL)aSelector;

/**
 * Attach a listener to run block object every time the event type occurs for items with specific primary key.
 *
 * @param eventType The type of the event to listen (<StorageEventType>: StorageEvent_PUT, StorageEvent_UPDATE or StorageEvent_DELETE)
 * @param primaryKey The primary key of objects of interested.
 * @param callback The block object which is called with the snapshot of affected item as an argument.
 */
- (TableRef*) on: (StorageEventType) eventType primaryKey:(NSString*)aPrimaryKeyValue callback:(void (^)(ItemSnapshot *item)) callback;

/**
 * Attach a listener to perform a selector of specified object every time the event type occurs for items with specific primary key.
 *
 * @param eventType The type of the event to listen (<StorageEventType>: StorageEvent_PUT, StorageEvent_UPDATE or StorageEvent_DELETE)
 * @param primaryKey The primary key of objects of interested.
 * @param objectToNotify The object to be notify.
 * @param selectorToPerform The selector of objectToNotify which is called with the snapshot of affected item as an argument.
 */
- (TableRef*) on: (StorageEventType) eventType primaryKey:(NSString*)aPrimaryKeyValue objectToNotify:(id)anObject selectorToPerform:(SEL)aSelector;

/**
 * Remove an event handler for all block objects for a specific event type.
 * 
 * @param eventType The type of the event to remove (<StorageEventType>: StorageEvent_PUT, StorageEvent_UPDATE or StorageEvent_DELETE)
 */
- (TableRef*) off: (StorageEventType) eventType;

/**
 * Remove an event handler for a specific selector.
 * 
 * @param eventType The type of the event to remove (<StorageEventType>: StorageEvent_PUT, StorageEvent_UPDATE or StorageEvent_DELETE)
 * @param objectToNotify The object which contains a selector to be removed.
 * @param selectorToPerform The selector of objectToNotify which should be removed.
 */
- (TableRef*) off: (StorageEventType) eventType objectToNotify:(id)anObject selectorToPerform:(SEL)aSelector;

/**
 * Remove an event handler for all block objects for a specific event type for a specific primary key.
 * 
 * @param eventType The type of the event to remove (<StorageEventType>: StorageEvent_PUT, StorageEvent_UPDATE or StorageEvent_DELETE)
 * @param primaryKey The primary key of objects of interested. 
 */
- (TableRef*) off: (StorageEventType) eventType primaryKey:(NSString*)aPrimaryKeyValue;

/**
 * Remove an event handler for a specific selector for a specific primary key.
 * 
 * @param eventType The type of the event to remove (<StorageEventType>: StorageEvent_PUT, StorageEvent_UPDATE or StorageEvent_DELETE)
 * @param primaryKey The primary key of objects of interested.  
 * @param objectToNotify The object which contains a selector to be removed.
 * @param selectorToPerform The selector of objectToNotify which should be removed.
 */
- (TableRef*) off: (StorageEventType) eventType primaryKey:(NSString*)aPrimaryKeyValue objectToNotify:(id)anObject selectorToPerform:(SEL)aSelector;

/**
 * Attach a listener to run block object only once when the event type occurs.
 *
 * @param eventType The type of the event to listen (<StorageEventType>: StorageEvent_PUT, StorageEvent_UPDATE or StorageEvent_DELETE)
 * @param callback The block object which is called with the snapshot of affected item as an argument.
 */
- (TableRef*) once: (StorageEventType) eventType callback:(void (^)(ItemSnapshot *item)) callback;

/**
 * Attach a listener to perform a selector of specified object only once when the event type occurs.
 *
 * @param eventType The type of the event to listen (<StorageEventType>: StorageEvent_PUT, StorageEvent_UPDATE or StorageEvent_DELETE)
 * @param objectToNotify The object to be notify.
 * @param selectorToPerform The selector of objectToNotify which is called with the snapshot of affected item as an argument.
 */
- (TableRef*) once: (StorageEventType) eventType objectToNotify:(id)anObject selectorToPerform:(SEL)aSelector;

/**
 * Attach a listener to run block object only once when the event type occurs for items with specific primary key.
 *
 * @param eventType The type of the event to listen (<StorageEventType>: StorageEvent_PUT, StorageEvent_UPDATE or StorageEvent_DELETE)
 * @param primaryKey The primary key of objects of interested.
 * @param callback The block object which is called with the snapshot of affected item as an argument.
 */
- (TableRef*) once: (StorageEventType) eventType primaryKey:(NSString*)aPrimaryKeyValue callback:(void (^)(ItemSnapshot *item)) callback;

/**
 * Attach a listener to perform a selector of specified object only once when the event type occurs for items with specific primary key.
 *
 * @param eventType The type of the event to listen (<StorageEventType>: StorageEvent_PUT, StorageEvent_UPDATE or StorageEvent_DELETE)
 * @param primaryKey The primary key of objects of interested.
 * @param objectToNotify The object to be notify.
 * @param selectorToPerform The selector of objectToNotify which is called with the snapshot of affected item as an argument.
 */
- (TableRef*) once: (StorageEventType) eventType primaryKey:(NSString*)aPrimaryKeyValue objectToNotify:(id)anObject selectorToPerform:(SEL)aSelector;

/**
 * Enables Push Notifications for table reference
 *
 */
- (TableRef*) enablePushNotifications;

/**
 * Disables Push Notifications for table reference
 *
 */
- (TableRef*) disablePushNotifications;

@end

//=========================================================


/**
 * ItemRef interface
 */
@interface ItemRef : NSObject{
    StorageContext *context;
    TableRef *table;
    NSString *primary;
    NSString *secondary;
    NSInteger *primaryDataType;
    NSInteger *secondaryDataType;
}

- (id) initWithPrimary: (TableRef*) aTable context:(StorageContext*)aContext primaryKeyValue:(NSString*)aPrimary;
- (id) initWithPrimaryAndSecondary: (TableRef*) aTable context:(StorageContext*)aContext primaryKeyValue:(NSString*)aPrimary secondaryKeyValue:(NSString*)aSecondary;

/**
 * Deletes an item specified by this reference.
 * 
 * @param success The block object to call with the snapshot of affected item as an argument, when the operation is completed.
 * @param error The block object to call if an exception occurred.
 */
- (ItemRef*) del: (void (^)(ItemSnapshot *success)) aSuccessCallback error:(void (^)(NSError *error)) anErrorCallback;

/** 
 * Gets an item snapshot specified by this item reference.
 *
 * @param success The block object to call with the snapshot of affected item as an argument, when the operation is completed.
 * @param error The block object to call if an exception occurred.
 */
- (ItemRef*) get: (void (^)(ItemSnapshot *success)) aSuccessCallback error:(void (^)(NSError *error)) anErrorCallback;

/**
 * Updates the stored item specified by this item reference.
 *
 * @param attributes The new properties of item to be updated.
 * @param success The block object to call with the snapshot of affected item as an argument, when the operation is completed.
 * @param error The block object to call if an exception occurred.
 */
- (ItemRef*) set: (NSDictionary*)attributes success: (void (^)(ItemSnapshot *success)) aSuccessCallback error:(void (^)(NSError *error)) anErrorCallback;


/**
 *   Increments a given attribute of an item. If the attribute doesn't exist, it is set to zero before the operation.
 *
 *   @param property The name of the item attribute.
 *   @param value The number to add. Defaults to 1 if invalid.
 *   @param success The block object to call with the snapshot of affected item as an argument, when the operation is completed.
 *   @param error The block object to call if an exception occurred.
 */
- (ItemRef*) incr:(NSString *)property withValue:(NSInteger)value success:(void (^)(ItemSnapshot *success)) aSuccessCallback error:(void (^)(NSError *error)) aErrorCallback;

/**
 *   Increments a given attribute of an item by default to 1. If the attribute doesn't exist, it is set to zero before the operation.
 *
 *   @param property The name of the item attribute.
 *   @param success The block object to call with the snapshot of affected item as an argument, when the operation is completed.
 *   @param error The block object to call if an exception occurred.
 */
- (ItemRef*) incr:(NSString *)property success:(void (^)(ItemSnapshot *success)) aSuccessCallback error:(void (^)(NSError *error)) aErrorCallback;

/**
 *   Decrements a given attribute of an item. If the attribute doesn't exist, it is set to zero before the operation.
 *
 *   @param property The name of the item attribute.
 *   @param value The number to add. Defaults to 1 if invalid.
 *   @param success The block object to call with the snapshot of affected item as an argument, when the operation is completed.
 *   @param error The block object to call if an exception occurred.
 */
- (ItemRef*) decr:(NSString *)property withValue:(NSInteger)value success:(void (^)(ItemSnapshot *success)) aSuccessCallback error:(void (^)(NSError *error)) aErrorCallback;


/**
 *   Decrements a given attribute of an item by default to 1. If the attribute doesn't exist, it is set to zero before the operation.
 *
 *   @param property The name of the item attribute.
 *   @param success The block object to call with the snapshot of affected item as an argument, when the operation is completed.
 *   @param error The block object to call if an exception occurred.
 */
- (ItemRef*) decr:(NSString *)property success:(void (^)(ItemSnapshot *success)) aSuccessCallback error:(void (^)(NSError *error)) aErrorCallback;

/**
 * Attach a listener to run block object every time the event type occurs for this item.
 *
 * @param eventType The type of the event to listen (<StorageEventType>: StorageEvent_PUT, StorageEvent_UPDATE or StorageEvent_DELETE)
 * @param callback The block object which is called with the snapshot of affected item as an argument.
 */
- (ItemRef*) on: (StorageEventType) eventType callback:(void (^)(ItemSnapshot *item)) callback;

/**
 * Attach a listener to perform a selector of specified object every time the event type occurs for this item.
 *
 * @param eventType The type of the event to listen (<StorageEventType>: StorageEvent_PUT, StorageEvent_UPDATE or StorageEvent_DELETE)
 * @param objectToNotify The object to be notify.
 * @param selectorToPerform The selector of objectToNotify which is called with the snapshot of affected item as an argument.
 */
- (ItemRef*) on: (StorageEventType) eventType objectToNotify:(id)anObject selectorToPerform:(SEL)aSelector;

/**
 * Remove an event handler for all block objects for a specific event type for this item.
 * 
 * @param eventType The type of the event to remove (<StorageEventType>: StorageEvent_PUT, StorageEvent_UPDATE or StorageEvent_DELETE)
 */
- (ItemRef*) off: (StorageEventType) eventType;

/**
 * Remove an event handler for a specific selector for this item.
 * 
 * @param eventType The type of the event to remove (<StorageEventType>: StorageEvent_PUT, StorageEvent_UPDATE or StorageEvent_DELETE)
 * @param objectToNotify The object which contains a selector to be removed.
 * @param selectorToPerform The selector of objectToNotify which should be removed.
 */
- (ItemRef*) off: (StorageEventType) eventType objectToNotify:(id)anObject selectorToPerform:(SEL)aSelector;

/**
 * Attach a listener to run block object only once when the event type occurs for this item.
 *
 * @param eventType The type of the event to listen (<StorageEventType>: StorageEvent_PUT, StorageEvent_UPDATE or StorageEvent_DELETE)
 * @param callback The block object which is called with the snapshot of affected item as an argument.
 */
- (ItemRef*) once: (StorageEventType) eventType callback:(void (^)(ItemSnapshot *item)) callback;

/**
 * Attach a listener to perform a selector of specified object only once when the event type occurs for this item.
 *
 * @param eventType The type of the event to listen (<StorageEventType>: StorageEvent_PUT, StorageEvent_UPDATE or StorageEvent_DELETE)
 * @param objectToNotify The object to be notify.
 * @param selectorToPerform The selector of objectToNotify which is called with the snapshot of affected item as an argument.
 */
- (ItemRef*) once: (StorageEventType) eventType objectToNotify:(id)anObject selectorToPerform:(SEL)aSelector;

/**
 * Enables Push Notifications for item reference
 *
 */
- (ItemRef*) enablePushNotifications;

/**
 * Disables Push Notifications for item reference
 *
 */
- (ItemRef*) disablePushNotifications;

@end

//=========================================================


/**
 * ItemSnapshot interface
 */
@interface ItemSnapshot : NSObject {
    ItemRef *iRef;
    NSDictionary *iVal;
    TableRef *tRef;
    StorageContext *context;
}

- (id)initWithRefContextAndVal:(TableRef*) aTableRef storageContext:(StorageContext*)aContext val:(NSDictionary*) aVal;

/**
 * Returns an item reference
 */
- (ItemRef*) ref;

/**
 * Return an item values in NSDictionary with properties names as a keys.
 */
- (NSDictionary*) val;
@end

//=========================================================

/**
 * TableSnapshot interface
 */
@interface TableSnapshot : NSObject {
    StorageContext *context;
    NSString *name;
}

- (id)initWithContextAndName:(StorageContext*) aContext val:(NSString*) aName;

/**
 * Returns a table reference
 */
- (TableRef*) ref;

/**
 * Returns a name of this table
 */
- (NSString*) val;
@end

