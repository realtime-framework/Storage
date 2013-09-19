var read = require("read");
var util = require('util');
var exec = require('child_process').exec;

var todoStorage = require("./data/realtimeStorage.js");
var processingOperation = false;
var previousOperations;
var lastTimestamp = Math.floor(+new Date()/1000);

var listName = "MyList";
var todos = [];

var showActive = true;
var showCompleted = true;

todoStorage.refresh = updateList;

var operations = {
	"0" : function(newListName){
		if(!newListName){
			previousOperations = "0";	
			clear();		
		}else{
			listName = newListName;
			updateList();
		}
	}, 

	"1" : function(task){
		if(!task){
			previousOperations = "1";
			clear();
		}else{
			addTodo(task);
		}
	},

	"2" : function(taskIndex){
		if(!taskIndex){
			previousOperations = "2";
			clear();
		}else{
			try{
				removeTodo(parseInt(taskIndex));
			}catch(e){
				console.log(e);
				clear();
			}			
		}
	},

	"3" : function(task){
		if(!task){
			previousOperations = "3";
			clear();
		}else{		
			try{		
				task = task.trim();
				var whiteSpaceIndex = task.indexOf(" ");
				var taskIndex = parseInt(task.substring(0,whiteSpaceIndex));
				var task = task.substring(whiteSpaceIndex + 1,task.length);
				editTodo(taskIndex,task);		
			}catch(e){
				console.log(e);
				clear();
			}	
		}
	},

	"4" : function(task){
		if(!task){
			previousOperations = "4";
			clear();
		}else{
			try{
				task = task.trim();
				var whiteSpaceIndex = task.indexOf(" ");
				var taskIndex = parseInt(task.substring(0,whiteSpaceIndex));
				var state = parseInt(task.substring(whiteSpaceIndex + 1,task.length));
				if(state == 1){
					state = true;
				}else if(state == 0){
					state = false;
				}else {
					throw error("Invalid state");
				}

				editTodoState(taskIndex,state);
			}catch(e){
				console.log(e);
				clear();
			}			
		}
	},

	"5" : function(stateText){
		if(!stateText){
			previousOperations = "5";
			clear();
		}else{
			try{
				var state = parseInt(stateText);
				if(state == 1){
					state = true;
				}else if(state == 0){
					state = false;
				}else {
					throw error("Invalid state");
				}

				markAll(state);
			}catch(e){
				console.log(e);
				clear();
			}			
		}
	},

	"6" : function(){
		showActive = false;
		showCompleted = true;
		clear();
	},

	"7" : function(){
		showActive = true;
		showCompleted = false;
		clear();
	},

	"8" : function(){
		showActive = true;
		showCompleted = true;
		clear();
	},
}

function clear() {
	exec('clear', function(error, stdout, stderr) {
		processingOperation = false;
		util.puts(stdout);
		renderMenu();
	});
};

function renderList(){
	todos.sort(function(a,b){
		return (a.timestamp - b.timestamp);
	});

	var result = "List: " + listName + "\n====================================\n";

	var taskMaxLength = 25;

	for(var i in todos){
		var item = todos[i];

		if((showActive && item.state == 0) || (showCompleted && item.state == 1)){
			var task = item.task;
			
			result += i + " - " + (item.state ? "x " : "o ") + task + "\n------------------------------------\n";
		}		
	}

	return result;
}

function renderMenuOptions(){
	result =  "\n0 - change list (list name ie: MyList)\n";
	result += "1 - add task (task text ie: do something)\n";
	result += "2 - remove task (task index ie: 1)\n";
	result += "3 - edit task (task index task text ie: 1 do something new)\n";
	result += "4 - change task state (task index state ie: 2 1)\n";
	result += "5 - change all task state (state ie: 1)\n";
	result += "6 - show completed\n";
	result += "7 - show active\n";
	result += "8 - show all\n\n";


	result += !previousOperations ? "Command: " : "Command '" + previousOperations + "' data: ";

	return result;
}

function renderMenu(){	
	read({
		prompt: renderList() + renderMenuOptions()
	},function(error,operation){		
		if(!processingOperation){
			processingOperation = true;
			if(!error){
				if(!previousOperations && operations[operation]){
					operations[operation]();
				}else if(previousOperations && operations[previousOperations]){
					operations[previousOperations](operation);
					previousOperations = null;
				}
			}else{
				console.log("Invalid operation:",error);
			}
		}		
	});
}

function todoExists(todo){
    for(var todoIndex in todos){
      var currentTodo = todos[todoIndex];
      if(currentTodo.timestamp == todo.timestamp){
        todos[todoIndex] = todo;
        return todoIndex;
      }
    }
    return -1;
  }

function addTodo(newTodo) {
	var newTodo = newTodo.trim();
	if (!newTodo.length) {
	  return;
	}

	lastTimestamp++;
	var todo = {
	  task: newTodo, 
	  state: false, 
	  timestamp: lastTimestamp, 
	  listName: listName
	}

	todos.push(todo);

	todoStorage.put(listName,[todo]);

	clear();
};

function removeTodo (taskIndex) {
	if(taskIndex < todos.length && taskIndex >= 0){
		var todo = todos[taskIndex];
		todos.splice(taskIndex, 1);
		todoStorage.remove(listName,todo);						
	}	
	clear();
};

function editTodo (taskIndex,task) {
    if(taskIndex < todos.length && taskIndex >= 0 && task && task.trim()){
    	var todo = todos[taskIndex];
    	todo.task = task;
    	todoStorage.put(listName,[todo]);    	
    }    
    clear();
};

function editTodoState (taskIndex,state) {
	if(taskIndex < todos.length && taskIndex >= 0){
		var todo = todos[taskIndex];
		todo.state = state;
		todoStorage.put(listName,[todo]);
	}
	clear();
};

function markAll (state) {
	todos.forEach(function (todo) {
	  todo.state = state;      
	});
	todoStorage.put(listName,todos);
	clear();
};

function updateList(){
	todos = [];
	todoStorage.get(listName,function(result){
	  if(result != null){
	    var resultIndex = todoExists(result);

	    if(resultIndex < 0 && !result.remove){          
	      todos.push(result);  
	    } else if(result.remove && resultIndex >= 0){
	      todos.splice(resultIndex, 1);
	    }        
	  }

	  clear();
	});
}

updateList();
