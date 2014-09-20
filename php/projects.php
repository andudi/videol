<?php
    $prj->settings();
    if (isset($_POST['create'])) $prj->create($_POST);
    $prj->projects();
?><!DOCTYPE html >
<html>
<head>
    <title><?=htmlspecialchars($prj->settings['title']);?></title>

    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>

</head>
<body>

    <div>
        <strong style="font-size:130%"><?=htmlspecialchars($prj->settings['title']);?></strong>
    </div>
    
    <div>
            <? if ($prj->access) { ?>
        <form action="/:<?=$prj->key;?>" method="post">
            New Project: <input type="text" name="project" value="<?=$prj->data['project'];?>" size="20">
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
