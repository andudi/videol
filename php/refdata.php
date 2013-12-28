<?php
    $prj->load();
    if (isset($_GET['save'])) $prj->save($_GET);
    if (isset($_GET['load'])) print json_encode($prj->data['refdata']);
?>