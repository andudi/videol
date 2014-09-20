<?php
    $prj->settings();
    $prj->load();
    if (!$prj->access) die("invalid key!");
    if (isset($_POST['save']))
    {
        if (!preg_match("/^\d\d\d\d\-\d\d\-\d\d$/",$_POST['date'])) die("invalid date!");
        $prj->save($_POST);
    }
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
        <br>
        <strong>Setup Project</strong>
            (
            <a href="/<?=$prj->project;?>">load</a>,
            <a href="/<?=$prj->project;?>:<?=$prj->key;?>,edit">edit</a>
            )
        <form action="/<?=$prj->project;?>:<?=$prj->key;?>,setup" method="post">
            <? foreach ($prj->fields as $field => $name) { ?>
            <p>
                <?=$name;?><br>
                <input type="text" name="<?=$field;?>" value="<?=htmlspecialchars($prj->data[$field]);?>" size="100">
            </p>
            <? } ?>
            <input type="submit" name="save" value="Save">
            <input type="submit" name="load" value="Load">
        </form>
    </div>

</body>
</html>
