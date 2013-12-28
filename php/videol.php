<?php
    $prj->load();
    if ($prj->project == "") die("invalid project!");
    if ($prj->key && !$prj->access) die("invalid key!");
?><!DOCTYPE html>
<html>
<head>
    <title>VideOL - Video Tracking for Orienteering Runners</title>

    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>

    <script src="http://code.jquery.com/jquery-1.10.2.min.js"></script>
    <script src="http://cdnjs.cloudflare.com/ajax/libs/paper.js/0.9.9/paper.min.js"></script>
    <script src="http://cdnjs.cloudflare.com/ajax/libs/jquery-mousewheel/3.1.3/jquery.mousewheel.min.js"></script>

    <script src="js/videolTRG.js"></script>
    <script src="js/videolREF.js"></script>
    <script src="js/videolMAP.js"></script>
    <script src="js/videolGPX.js"></script>
    <script src="js/videolVID.js"></script>

    <script>
        $(document).ready(function()
        {
            console.log("creating videol objects...");
            myTRG = new VideolTRG();
            myVID = new VideolVID(["<?=strtr($prj->data['videourls'],array(','=>'","'));?>"]);
            myREF = new VideolREF('<?=$prj->project."','".$prj->key;?>');
            myMAP = new VideolMAP("<?=$prj->data['mapurl'];?>");
            myGPX = new VideolGPX("<?=$prj->data['trackurl'];?>");
            console.log("videol objects ready!");
        });
    </script>

</head>
<body>

    <div>
        <strong style="font-size:130%">VideOL - Video Tracking for Orienteering Runners</strong>
    </div>
    
    <div style="width:640;height:360;float:left;text-align:left;">
        <?=$prj->data['title'];?>, <?=$prj->data['name'];?>, <?=$prj->data['date'];?><br>
        <video id="player" width="640" height="360" controls="controls" preload="auto"></video>
        <br>
        <input type="button" value="-60s" onclick="myVID.step_time(-60)">
        <input type="button" value="-10s" onclick="myVID.step_time(-10)">
        <input type="button" value="-1s" onclick="myVID.step_time(-1)">
        <input type="button" value="+1s" onclick="myVID.step_time(+1)">
        <input type="button" value="+10s" onclick="myVID.step_time(+10)">
        <input type="button" value="+60s" onclick="myVID.step_time(+60)">
    </div>

    <div style="width:640;height:360;float:left;text-align:left;">
        <span id="statusline"></span><br>
        <canvas id="canvas" width="640" height="360"></canvas>
        <br>
        <input type="button" value="Zoom In" onclick="myMAP.zoom_map(+1)">
        <input type="button" value="Zoom Out" onclick="myMAP.zoom_map(-1)">
        <input type="button" value="Left" onclick="myMAP.step_map(-1,0)">
        <input type="button" value="Up" onclick="myMAP.step_map(0,+1)">
        <input type="button" value="Down" onclick="myMAP.step_map(0,-1)">
        <input type="button" value="Right" onclick="myMAP.step_map(+1,0)">
        <input type="button" id="movemode" value="Mode" onclick="myMAP.next_movemode()">
        <input type="button" value="Reset" onclick="myMAP.reset_map()">
    </div>
    <div style="clear:both;"></div>

<?if($prj->access):?>
    <div>
        <form>
            <span id="calibline"></span><br>
            <strong>Time Offset</strong>
            <input type="button" id="timeoffset" value="Calibrate" onclick="myREF.ctrl_calibration('timeoffset')">
            <br>
            <span>Finetuning of time offset:</span>
            <input type="button" value="Backward" onclick="myREF.move_timeoffset(-1)">
            <input type="button" value="Forward" onclick="myREF.move_timeoffset(+1)">
            <br>
            <strong>Reference Points</strong>
            <input type="button" id="trackmap" value="Calibrate" onclick="myREF.ctrl_calibration('trackmap')">
            <br>
            <span>Finetuning of reference point 1:</span>
            <input type="button" value="Left" onclick="myREF.move_refpoint(0,-1,0)">
            <input type="button" value="Up" onclick="myREF.move_refpoint(0,0,+1)">
            <input type="button" value="Down" onclick="myREF.move_refpoint(0,0,-1)">
            <input type="button" value="Right" onclick="myREF.move_refpoint(0,+1,0)">
            <br>
            <span>Finetuning of reference point 2:</span>
            <input type="button" value="Left" onclick="myREF.move_refpoint(1,-1,0)">
            <input type="button" value="Up" onclick="myREF.move_refpoint(1,0,+1)">
            <input type="button" value="Down" onclick="myREF.move_refpoint(1,0,-1)">
            <input type="button" value="Right" onclick="myREF.move_refpoint(1,+1,0)">
            <br>
            <span>Finetuning of reference point 3:</span>
            <input type="button" value="Left" onclick="myREF.move_refpoint(2,-1,0)">
            <input type="button" value="Up" onclick="myREF.move_refpoint(2,0,+1)">
            <input type="button" value="Down" onclick="myREF.move_refpoint(2,0,-1)">
            <input type="button" value="Right" onclick="myREF.move_refpoint(2,+1,0)">
            <br>
            <strong>Reference Datas</strong>
            <input type="button" value="Save" onclick="myREF.save_refdata()">
            <input type="button" value="Load" onclick="myREF.load_refdata(true)">
        </form>
    </div>
<?endif;?>
    <div style="text-align:right;">
        <br>
        <br>
        <a href="https://github.com/andudi/videol" target="_blank">VideOL</a> by Andreas Dick
    </div>

</body>
</html>
 