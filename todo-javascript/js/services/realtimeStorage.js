(function (TodoRealtimeStorage, undefined) {
	var RealtimeStorage = function(configuration){
		if(RealtimeStorage.caller != RealtimeStorage.getInstance){
			throw new Error("This object cannot be instanciated");
		}

		this.operationBuffer = [];

		this.storage = null;

		this.tableRef;

		this.notificationCallback;

		this.refresh;

		this.performingPut;

		this.initialize();
	};

	RealtimeStorage.instance = null;

	RealtimeStorage.getInstance = function(){
		if(this.instance === null){
			this.instance = new RealtimeStorage();
		}
		return this.instance;
	};

	RealtimeStorage.prototype = {
		initialize : function(){
			var configuration = { 
				applicationKey: TodoRealtimeStorage.applicationKey,
                authenticationToken: TodoRealtimeStorage.authenticationToken, 
                onReconnecting: this.onReconnecting.bind(this),
                onReconnect: this.onReconnect.bind(this)
            };

			Realtime.Storage.create(
				configuration,
				function(ref) {
					this.storage = ref; 
					this.tableRef = this.storage.table(TodoRealtimeStorage.tableName);
					this.emptyBufferedOperations();                                                           
				}.bind(this),
				function(error){
					console.log(error);
				}
			);
		},

		onReconnecting : function(){
			console.log("Reconnecting realtime connection");
		},

		onReconnect : function(){
			this.emptyBufferedOperations();
			if(this.refresh) {
				this.refresh();
			}
		},

		onPut : function(itemSnapshot){
			if(itemSnapshot){
				var todo = itemSnapshot.val();
				todo.state = todo.state == 1 ? true : false;
				if(this.notificationCallback != null) {
					this.notificationCallback(todo);		
				}							
			}else{
				if(this.notificationCallback != null){
					this.notificationCallback(null);	
				}							
			}
		},

		onDelete : function(itemSnapshot){
			var todo = itemSnapshot.val();
			todo.remove = true;
			if(this.notificationCallback != null) {
				this.notificationCallback(todo);		
			}	
		},

		onUpdate : function(itemSnapshot){
			if(itemSnapshot){
				var todo = itemSnapshot.val();
				todo.state = todo.state == 1 ? true : false;
				if(this.notificationCallback != null) {
					this.notificationCallback(todo);		
				}							
			}else{
				if(this.notificationCallback != null){
					this.notificationCallback(null);	
				}							
			}
		},

		get: function (listName,callback) {
			if(!this.buffered(this.get,listName,callback)){	
				this.tableRef.off("update");
				this.tableRef.off("delete");
				this.tableRef.off("put");

				this.notificationCallback = callback;
				
				this.tableRef = this.storage.table(TodoRealtimeStorage.tableName).equals({item: "listName", value: listName });
				
				this.tableRef.on("put",this.onPut.bind(this));
				this.tableRef.on("delete",this.onDelete.bind(this));
				this.tableRef.on("update",this.onUpdate.bind(this));
			}
		},

		singlePut : function(listName,todo,callback){
			this.tableRef.push({
				task: todo.task, 
				state: todo.state ? 1 : 0, 
				timestamp: todo.timestamp, 
				listName: todo.listName
			}				
			,function(success){
				if(callback != null){
					callback(null);
				}
			}
			,function(error){
				console.log("Error in put:",error);

				this.operationBuffer.push({
					method : this.put,
					data : [listName,[todo],callback]
				});

				if(callback != null){
					callback(error);
				}
			}.bind(this));				
		},

		put: function (listName,todos,callback) {
			if(!this.buffered(this.put,listName,todos,callback)){
				for(var todoIndex in todos){
					var todo = todos[todoIndex];
					this.singlePut(listName,todo,callback);					
				}				
			}
		},

		remove : function(listName,todo,callback){
			if(!this.buffered(this.remove,listName,todo,callback)){
				var itemRef = this.tableRef.item({
					primary: todo.listName,
					secondary: todo.timestamp
				});

				itemRef.del(null
					,function(success){
						if(callback != null){
							callback(null);
						}
					}
					,function(error){ 
						console.log(error); 

						this.operationBuffer.push({
							method : this.remove,
							data : [listName,todo,callback]
						});

						if(callback != null){
							callback(error);
						}
					}.bind(this)
				);
			}
		},

		buffered : function() {
			var buffered = false;

			if(!this.storage){
				var data = [];
				if(arguments.length > 1){
					for(var i = 1; i < arguments.length; i++){
						data.push(arguments[i]);
					}
				}

				this.operationBuffer.push({
					method : arguments[0],
					data : data
				});

				buffered = true;
			}

			return buffered;
		},

		emptyBufferedOperations : function(){			
			if(this.operationBuffer.length > 0){
				var operation = this.operationBuffer.shift();
				operation.method.apply(this,operation.data);
				if(this.operationBuffer.length > 0){
					this.emptyBufferedOperations();
				}			
			}
		}
	};

	TodoRealtimeStorage.RealtimeStorage = RealtimeStorage.getInstance();
})(window.TodoRealtimeStorage = window.TodoRealtimeStorage || {});