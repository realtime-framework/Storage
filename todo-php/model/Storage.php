<?php


/**
* 
*/
class Storage
{
	var $fields;
	var $url;

	function __construct($ortcConfig, $serverUrl)
	{
		$this->fields = $ortcConfig;
		$this->url = $serverUrl;
	}

	function makeRequest()
	{
			$ch = curl_init($this->url);
			curl_setopt_array($ch, array(
			    CURLOPT_POST => TRUE,
			    CURLOPT_RETURNTRANSFER => TRUE,
			    CURLOPT_HTTPHEADER => array(
			        'Content-Type: application/json'
			    ),
			    CURLOPT_POSTFIELDS => json_encode($this->fields)
			));

			// Send the request
			$response = curl_exec($ch);

			// Check for errors
			if($response === FALSE){
			    die(curl_error($ch));
			}

			// Decode the response
			return $response;
	}
}

	



// use key 'http' even if you send the request to https://...

?>