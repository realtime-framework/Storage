/*global todomvc, angular */
'use strict';

/**
 * The main controller for the app. The controller:
 * - retrieves and persists the model via the todoStorage service
 * - exposes the model to the template and provides event handlers
 */
todomvc.controller('TodoCtrl', function TodoCtrl($scope, $location, todoStorage, filterFilter) {
  $scope.listDisabled = true;
  var listName = $scope.listName = 'MyList';
  var todos;
  var lastTimestamp = Math.floor(+new Date()/1000);

  todoStorage.refresh = updateList;

  updateList();

  $scope.newTodo = '';
  $scope.editedTodo = null;

  if ($location.path() === '') {
    $location.path('/');
  }

  $scope.location = $location;

  $scope.$watch('location.path()', function (path) {
    $scope.statusFilter = (path === '/active') ?
      { state: false } : (path === '/completed') ?
      { state: true } : null;

  });

  $scope.changeList = function(){
    updateList();
  }

  $scope.addTodo = function () {
    var newTodo = $scope.newTodo.trim();
    if (!newTodo.length) {
      return;
    }

    lastTimestamp++;
    var todo = {
      task: newTodo, 
      state: false, 
      timestamp: lastTimestamp, 
      listName: $scope.listName
    }

    todos.push(todo);

    todoStorage.put($scope.listName,[todo]);

    $scope.newTodo = '';
  };

  $scope.editTodo = function (todo) {
    $scope.editedTodo = todo;
    $scope.originalTodo = angular.extend({}, todo);
  };

  $scope.editTodoState = function (todo) {
    todoStorage.put($scope.listName,[todo]);
  };

  $scope.doneEditing = function (todo) {
    $scope.editedTodo = null;
    if(todo.task){
      todo.task = todo.task.trim();  
      todoStorage.put($scope.listName,[todo]);
    }else{
      $scope.removeTodo(todo);
    }
  };

  $scope.revertEditing = function (todo) {
    todos[todos.indexOf(todo)] = $scope.originalTodo;
    $scope.doneEditing($scope.originalTodo);
  };

  $scope.removeTodo = function (todo) {
    todos.splice(todos.indexOf(todo), 1);
    todoStorage.remove($scope.listName,todo);
  };

  $scope.clearCompletedTodos = function () {
    $scope.todos = todos = todos.filter(function (val) {
      return !val.state;
    });
  };

  $scope.markAll = function (state) {
    todos.forEach(function (todo) {
      todo.state = state;      
    });
    todoStorage.put($scope.listName,todos);
  };

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

  function updateList(){
    $scope.listDisabled = true;
    todos = $scope.todos = [];
    todoStorage.get($scope.listName,function(result){
      if(result != null){
        var resultIndex = todoExists(result);

        if(resultIndex < 0 && !result.remove){          
          todos.push(result);  
        } else if(result.remove && resultIndex >= 0){
          todos.splice(resultIndex, 1);
        }        
      }else{
        $scope.listDisabled = false;
      }

      todos.sort(function(a,b){
        return (a.timestamp - b.timestamp);
      });

      $scope.$apply();
    });
  }
  
});