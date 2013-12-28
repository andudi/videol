// The VideOL javascript library
// Copyright: Andreas Dick
// License: GPLv2

// the video player handling
VideolVID = function(videourls)
{
    // insert the video links to the html objects
    $.each(videourls, function(index, videourl)
    {
        $("video").append($("<source/>",
        {
            'src': videourl,
            'type': "video/" + videourl.match(/([^\.]*$)/)[0],
        }));
    });
    
    // create video player and define events
    var Player = document.getElementById("player");
    Player.videol_ready = false;
    Player.addEventListener("loadedmetadata", function()
    {
        // indicate player ready
        Player.videol_ready = true;
        myTRG.trigger('VID');
    });
    Player.addEventListener("timeupdate", function()
    {
        if (Player.currentTime)
        {
            var time = Math.floor(Player.currentTime);
            if (time != Time)
            {
                Time = time;
                myMAP.update_map(false);
            }
        }
        else Player.currentTime = Time;
    });
    Player.addEventListener("error", function()
    {
        alert("Your browser do probably not support this kind of html5 video!");
    });
    
    // toggle playing of the video
    this.toggle_video = function()
    {
        if (Player.paused) Player.play();
        else Player.pause();
    }
    
    // handling of the video time
    var Time = 0;
    this.init_time = function()
    {
        Time = myREF.get_configs().videotime;
        if (Player.videol_ready) Player.currentTime = Time;
    }
    this.set_time = function(time)
    {
        if (time >= 0) Time = time;
        else Time = 0;
        if (Player.videol_ready) Player.currentTime = Time;
        myMAP.update_map(true);
    }
    this.step_time = function(step)
    {
        myVID.set_time(Time+step);
    }
    this.get_time = function() { return Time; }
}
