

<?php
require_once('model/storage.php');
require_once('view/view.php');
require_once('Controller/mainController.php');

$controller = new MainController();
$controller->action();

?>

