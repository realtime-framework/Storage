<?php

/**
* 
*/
class View
{
	var $todoList;

	function __construct($todoList)
	{
		$this->todoList = $todoList;
		$this->drawHeader();
		$this->drawForm();
		$this->drawItems();
		$this->drawFoother();
	}

	function drawHeader()
	{
		echo '<!DOCTYPE html>
				<html lang="en" ng-app="todomvc" data-framework="angularjs">
					<head>
						<meta charset="utf-8">
						<meta http-equiv="X-UA-Compatible" content="IE=edge">
						<title>TODO REALTIME STORAGE</title>
						

						 <!-- Latest compiled and minified CSS -->
						<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.2.0/css/bootstrap.min.css">

						<!-- Optional theme -->
						<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.2.0/css/bootstrap-theme.min.css">

						<!-- Latest compiled and minified JavaScript -->
						<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.2.0/js/bootstrap.min.js"></script>
						<script src="http://code.jquery.com/jquery-2.1.0.min.js"></script>

						<link rel="stylesheet" href="style/todo-storage.css">
						<style>[ng-cloak] { display: none; }</style>

						<script type="text/javascript" src="https://storage-cdn.realtime.co/storage/1.0.0/realtime-storage-min.js"></script>
						<script src="js/script.js"></script>
					</head>
					<body>
						<img id="logo" src="images/realtime.png" alt="realtime" class="img-rounded">
						<div id="content">';
	}

	function drawForm(){
		?>
		<div class="row">
			<h2>New todo:</h2>
			<form method="POST" action="index.php">
				<input type="text" name="task" class="form-control" value="Insert new task">
				</br>
				<button type="submit" class="btn btn-primary">Submit</button>
			</form>
		</div>
		<?php
	}


	function drawItems(){		
		?> 
		</br>
		</br>
		</br>
		<div class="row">	
		<h2>Todo list:</h2>
		<table id="todo-list" class="table table-hover"> 
			<tr><th>Task</th><th>State</th><th>Delete?</th></tr>
		<?php
		$json = json_decode($this->todoList);
		foreach ($json->data->items as $item) {	
			$check;
			$clType;
			if ($item->state == 1) {
				$check = "<a href='index.php?update={$item->timestamp}&val=0' class=\"btn btn-success\">Done</a>";
				$clType = 'success';
			}else if ($item->state == 0) {
				$check = "<a href='index.php?update={$item->timestamp}&val=1' class=\"btn btn-warning\">To-do</a>";
				$clType = 'danger';
			}		
			echo "<tr class='{$clType}' id='{$item->timestamp}'><td>".$item->task."</td><td id='check_{$item->timestamp}'>".$check."</td><td><a href='index.php?delete={$item->timestamp}' class=\"btn btn-danger\">Delete</a></td></tr>";
		}
		?>
			</table>
		</div>

		<?php
	}

	function drawFoother()
	{
		echo '</div></body>
		</html>';
	}

}

?>