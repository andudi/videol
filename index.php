<?php
    include "php/functions.php";
    $args = (isset($_GET['args']))?$_GET['args']:"";
    $prj = new Project($args);

    $file = "php/".$prj->cmd.".php";
    if (!is_file($file)) die("invalid command!");
    include $file;
?>
