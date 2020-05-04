<?php

$json = file_get_contents("php://input");
$data = json_decode($json, true);

echo json_encode($data);

$myfile = fopen("highscore.json", "w");
fwrite($myfile, json_encode($data));
fclose($myfile);

?>
