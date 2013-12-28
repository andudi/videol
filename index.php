<?php
    include "php/functions.php";
    $args = (isset($_GET['args']))?$_GET['args']:"";
    $prj = new Project($args);

    if ($prj->cmd != 'index')
    {
        $file = "php/".$prj->cmd.".php";
        if (!is_file($file)) die("invalid command!");
        include $file;
        exit;
    }
    $prj->load();
    if (isset($_POST['create'])) $prj->create($_POST);
    $prj->index();
?><!DOCTYPE html >
<html>
<head>
    <title>VideOL - Video Tracking for Orienteering Runners</title>

    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>

</head>
<body>

    <div>
        <strong style="font-size:130%">VideOL - Video Tracking for Orienteering Runners</strong>
    </div>
    
    <div>
            <? if ($prj->access) { ?>
        <form action="/:<?=$prj->key;?>" method="post">
            New Project: <input type="text" name="project" value="<?=$prj->data['project'];?>" size="20">:
            <input type="text" name="key" value="<?=$prj->data['key'];?>" size="10">
            <input type="submit" name="create" value="Create">
        </form>
            <? } ?>

        <? foreach ($prj->list as $project) { ?>
        <p>
            <strong><?=htmlspecialchars($project['title']);?></strong>
            <? if ($prj->access) { ?>
                (<a href="/<?=$project['project'];?>">load</a>,
                <a href="/<?=$project['project'];?>:<?=$project['key'];?>,edit">edit</a>,
                <a href="/<?=$project['project'];?>:<?=$project['key'];?>,setup">setup</a>)
            <? } else { ?>
                (<a href="/<?=$project['project'];?>">load</a>)
            <? } ?>
            <br>
            <? if ($project['name']) { ?><?=htmlspecialchars($project['name']);?>, <? } ?>
            <?=htmlspecialchars($project['date']);?>
        </p>
        <? } ?>
    </div>

</body>
</html>
