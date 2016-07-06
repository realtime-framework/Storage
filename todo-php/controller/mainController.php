<?php

/**
* 
*/
class MainController
{
	var $view;
	var $model;
	function __construct()
	{
		
	}

	function action()
	{
		if (isset($_POST['task'])) {
			$url = 'http://storage-backend-prd-useast1.realtime.co/putItem';
	 		$fields = array('applicationKey'=>'2Ze1dz', 'table'=>'todoTable', 'authenticationToken'=>'TodoRealtimeStorage', 'item'=> array("task"=>$_POST['task'],"state"=>0,"timestamp"=>time(),"listName"=>"storage-demo"),);
	 
			$this->model = new Storage($fields, $url);
			$data = $this->model->makeRequest();
		}
		if (isset($_GET['delete'])) {
			$del = $_GET['delete'];
			$url = 'http://storage-backend-prd-useast1.realtime.co/deleteItem';
	 		$fields = array('applicationKey'=>'2Ze1dz', 'table'=>'todoTable', 'authenticationToken'=>'TodoRealtimeStorage', 'key'=> array('primary'=>'storage-demo', 'secondary'=>intval($del)),);
	 
			$this->model = new Storage($fields, $url);
			$data = $this->model->makeRequest();
		}
		if (isset($_GET['update'])) {
			$url = 'http://storage-backend-prd-useast1.realtime.co/updateItem';
	 		$fields = array('applicationKey'=>'2Ze1dz', 'table'=>'todoTable', 'authenticationToken'=>'TodoRealtimeStorage', 'key'=> array('primary'=>'storage-demo', 'secondary'=>intval($_GET['update'])), 'item' => array('state' => $_GET['val'], ),);
	 
			$this->model = new Storage($fields, $url);
			$data = $this->model->makeRequest();
		}
		$this->getInfo();
	}

	function getInfo(){
		$url = 'http://storage-backend-prd-useast1.realtime.co/queryItems';
 		$fields = array('applicationKey'=>'2Ze1dz', 'table'=>'todoTable', 'authenticationToken'=>'TodoRealtimeStorage', 'key'=> array('primary'=>'storage-demo'),);
 
		$this->model = new Storage($fields, $url);
		$data = $this->model->makeRequest();
		$json = json_decode($data, true);
		if (isset($json['error'])) {
			echo $data;
		}elseif (isset($json['data'])) {
			$this->view = new view($data);
		}	
	}
}

?>