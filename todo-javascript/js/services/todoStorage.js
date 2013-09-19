/*global todomvc */
'use strict';

/**
 * Services that persists and retrieves TODOs from Realtime Storage
 */
todomvc.factory('todoStorage', function () {  	
	return TodoRealtimeStorage.RealtimeStorage;
});