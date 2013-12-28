// The VideOL javascript library
// Copyright: Andreas Dick
// License: GPLv2

// handling of reference datas
VideolREF = function(project, key)
{
    // this project
    var Project = project;
    var Key = key;
    
	// handling of the referencing data
	var Refdata = { };
	this.load_refdata = function(reload)
	{
    	Refdata.timeoffset = 0;
    	Refdata.mapref = [ ];
    	Refdata.trackref = [ ];
    	Refdata.configs =
    	{
    	    'filter': 5,
    	    'speedmax': 15,
    	    'iniscale': 0.5,
    	    'mapposx': 0,
    	    'mapposy': 0,
    	    'mapscale': 0.5,
    	    'mapangle': 0,
    	    'videotime': 0,
    	    'starttime': 0,
    	    'endtime': 0,
    	    'movemode': 0,
    	};
        $.get("index.php?args="+Project+":"+Key+",refdata", { 'load': "" }, function(refdata)
        {
            if (refdata.timeoffset !== undefined) { Refdata.timeoffset = Number(refdata.timeoffset); }
            if (refdata.mapref !== undefined)
            {
                Refdata.mapref[0] = { 'x': Number(refdata.mapref[0].x), 'y': Number(refdata.mapref[0].y) }
                Refdata.mapref[1] = { 'x': Number(refdata.mapref[1].x), 'y': Number(refdata.mapref[1].y) }
                Refdata.mapref[2] = { 'x': Number(refdata.mapref[2].x), 'y': Number(refdata.mapref[2].y) }
            }
            if (refdata.trackref !== undefined)
            {
                Refdata.trackref[0] = { 'x': Number(refdata.trackref[0].x), 'y': Number(refdata.trackref[0].y) }
                Refdata.trackref[1] = { 'x': Number(refdata.trackref[1].x), 'y': Number(refdata.trackref[1].y) }
                Refdata.trackref[2] = { 'x': Number(refdata.trackref[2].x), 'y': Number(refdata.trackref[2].y) }
            }
            if (refdata.configs !== undefined)
            {
                for (config in refdata.configs) Refdata.configs[config] = Number(refdata.configs[config]);
            }
            if (reload)
            {
                myVID.init_time();
                myMAP.init_map();
            }
            else
            {
                // indicate loading finished
                myTRG.trigger('REF');
            }
    	}, "json");
    }
	this.save_refdata = function()
	{
	    var refdata = { };
	    refdata.timeoffset = Refdata.timeoffset;
	    if (myREF.is_trackmap()) refdata.mapref = Refdata.mapref;
	    if (myREF.is_trackmap()) refdata.trackref = Refdata.trackref;

	    refdata.configs = Refdata.configs;
	    refdata.configs.mapposx = myMAP.get_mapdata('mapposx');
	    refdata.configs.mapposy = myMAP.get_mapdata('mapposy');
	    refdata.configs.mapscale = myMAP.get_mapdata('mapscale');
	    refdata.configs.mapangle = myMAP.get_mapdata('mapangle');
	    refdata.configs.videotime = myVID.get_time();
	    refdata.configs.movemode = myMAP.get_movemode();

	    $.get("index.php?args="+Project+":"+Key+",refdata", { 'save': "", 'refdata': refdata });
	}
	this.get_configs = function() { return Refdata.configs; }
	this.is_access = function() { return (key != ''); }

	// start loading refdata object here
    this.load_refdata(false);

    // speed values and its corresponding color
    var Speedcolors =
    [
        { speed: 0.00, color: "#f00", }, // red
        { speed: 0.25, color: "#f70", }, // orange
        { speed: 0.50, color: "#ff0", }, // yellow
        { speed: 0.75, color: "#0f0", }, // green
        { speed: 1.00, color: "#00f", }, // blue
    ];
    this.get_speedcolor = function(speed)
    {
        var color = "#fff";
        var relspeed = speed/Refdata.configs.speedmax;
        $.each(Speedcolors, function(index, speedcolor)
        {
            if (relspeed < speedcolor.speed) { return false; }
            color = speedcolor.color;   
        });
        return color;
    }

	// handling of the video time offset
	this.reset_timeoffset = function()
	{
		Refdata.timeoffset = 0;
		// reset pointer position
        myMAP.draw_pointer();
	}
	this.set_timeoffset = function(timeoffset)
	{
		Refdata.timeoffset = timeoffset;
		// set new pointer position
		myMAP.draw_pointer();
	}
	this.get_timeoffset = function()
	{
		return Refdata.timeoffset;
	}
	this.move_timeoffset = function(timediff)
	{
		Refdata.timeoffset += timediff;
		// set new pointer position
        myMAP.draw_pointer();
	}

	// handling of track mapping
	this.reset_trackmap = function()
	{
	    delete Refdata.trackmap;
    	Refdata.mapref = [ ];
    	Refdata.trackref = [ ];
        // recreate default track
        myMAP.load_trackmap();
        myMAP.draw_all();
    }
	this.set_mapref = function(mappoint)
	{
        Refdata.mapref.push({ 'x': mappoint.x, 'y': mappoint.y });
	}
	this.set_trackref = function(trackpoint)
	{
        Refdata.trackref.push({ 'x': trackpoint.x, 'y': trackpoint.y });
	}
	this.move_refpoint = function(refnum, moveX, moveY)
	{
	    if (Refdata.mapref[refnum] !== undefined)
	    {
	        Refdata.mapref[refnum].x += moveX;
	        Refdata.mapref[refnum].y -= moveY;
	        // recreate track
            myMAP.load_trackmap();
            myMAP.draw_all();
        }
	}
	this.get_refpoints = function()
	{
	    if (Refdata.mapref !== undefined)
    	    return Refdata.mapref;
        else
            return [];
    }
	this.is_trackmap = function()
	{
	    return (Refdata.mapref.length == 3) && (Refdata.trackref.length == 3);
	}
	this.get_trackmap = function()
	{
        var mMx = (Refdata.mapref[0].x + Refdata.mapref[1].x)/2;
        var mMy = (Refdata.mapref[0].y + Refdata.mapref[1].y)/2;
        var mTx = (Refdata.trackref[0].x + Refdata.trackref[1].x)/2;
        var mTy = (Refdata.trackref[0].y + Refdata.trackref[1].y)/2;
        var dMx = Refdata.mapref[1].x - Refdata.mapref[0].x;
        var dMy = Refdata.mapref[1].y - Refdata.mapref[0].y;
        var dTx = Refdata.trackref[1].x - Refdata.trackref[0].x;
        var dTy = Refdata.trackref[1].y - Refdata.trackref[0].y;
        var s = Math.sqrt(dMx*dMx+dMy*dMy) / Math.sqrt(dTx*dTx+dTy*dTy);

        var aM,aT;
        if ((dMx>dMy)&&(-dMx<dMy)) { aM = Math.atan(dMy/dMx); }
        if ((dMx<dMy)&&(-dMx<dMy)) { aM = -Math.atan(dMx/dMy) + Math.PI/2; }
        if ((dMx<dMy)&&(-dMx>dMy)) { aM = Math.atan(dMy/dMx) + Math.PI; }
        if ((dMx>dMy)&&(-dMx>dMy)) { aM = -Math.atan(dMx/dMy) + 3/2*Math.PI; }
        if ((dTx>dTy)&&(-dTx<dTy)) { aT = Math.atan(dTy/dTx); }
        if ((dTx<dTy)&&(-dTx<dTy)) { aT = -Math.atan(dTx/dTy) + Math.PI/2; }
        if ((dTx<dTy)&&(-dTx>dTy)) { aT = Math.atan(dTy/dTx) + Math.PI; }
        if ((dTx>dTy)&&(-dTx>dTy)) { aT = -Math.atan(dTx/dTy) + 3/2*Math.PI; }
        var saM = Math.sin(aM);
        var caM = Math.cos(aM);
        var saT = Math.sin(aT);
        var caT = Math.cos(aT);

        var dM3x = +(Refdata.mapref[2].x - mMx)*caM + (Refdata.mapref[2].y - mMy)*saM;
        var dM3y = -(Refdata.mapref[2].x - mMx)*saM + (Refdata.mapref[2].y - mMy)*caM;
        var dT3x = +(Refdata.trackref[2].x - mTx)*caT + (Refdata.trackref[2].y - mTy)*saT;
        var dT3y = -(Refdata.trackref[2].x - mTx)*saT + (Refdata.trackref[2].y - mTy)*caT;
        var d = dM3y / (s*dT3y);
        var z = d*(dM3x - s*dT3x) / dM3y;
        
        var a11 = s*(caT*caM - z*saT*caM + d*saT*saM);
        var a12 = s*(saT*caM + z*caT*caM - d*caT*saM);
        var a21 = s*(caT*saM - z*saT*saM - d*saT*caM);
        var a22 = s*(saT*saM + z*caT*saM + d*caT*caM);

        var trackmap =
        {
            'a': a11, 'b': a12, 'c': a21, 'd': a22,
            'tx': mMx - (a11*mTx + a12*mTy),
            'ty': mMy - (a21*mTx + a22*mTy),
        };
        return trackmap;
	}
	
	// handling of mouse clicking modes
	var Clickmode = "setvideo";
	this.set_clickmode = function(mode) { Clickmode = mode; }
	this.get_clickmode = function() { return Clickmode; }

	// handling of calibration states
	var Laststate = "";
	this.ctrl_calibration = function(state)
	{
	    var abort = false;
		switch (state)
		{
		case "timeoffset":
		    if (Laststate != "timeoffset")
		    {
                this.reset_timeoffset();
                $("#timeoffset").val("Abort");
                $("#calibline").html("<strong>Set Time Offset:</strong><br>" +
        		        "1) move video to a known position<br>" +
                        "2) click to the corresponding track point");
        		Clickmode = "timeoffset";
            }
            else { abort = true; }
            break;
		case "timeoffset_end":
		    if (Laststate == "timeoffset")
		    {
        		$("#timeoffset").val("Calibrate");
        		$("#calibline").html("calibration finished!");
		    	Clickmode = "setvideo";
            }
            else { abort = true; }
			break;

		case "trackmap":
		    if (!/trackmap_(\d)/.test(Laststate))
		    {
                this.reset_trackmap();
                $("#trackmap").val("Abort");
                $("#calibline").html("<strong>Set Point 1:</strong> " +
                        "1) click on a known point on the track");
                Clickmode = "trackref";
                state = "trackmap_1";
			}
            else { abort = true; }
            break;
		case "trackmap_track":
		    if (/trackmap_([123])/.test(Laststate))
		    {
    		    var refnum = /trackmap_(\d)/.exec(Laststate)[1];
                $("#calibline").html("<strong>Set Point "+refnum+":</strong> " +
                        "2) click to the corresponding point on the map");
                Clickmode = "mapref";
                state = Laststate;
			}
            else { abort = true; }
            break;
		case "trackmap_map":
		    if ((Laststate == "trackmap_1") || (Laststate == "trackmap_2"))
		    {
                var refnum = Number(/trackmap_(\d)/.exec(Laststate)[1]) + 1;
                $("#calibline").html("<strong>Set Point "+refnum+":</strong> " +
                        "1) click on a known point on the track");
                Clickmode = "trackref";
                state = "trackmap_"+refnum;
		    }
	        else if (Laststate == "trackmap_3")
	        {
	            myMAP.load_trackmap();
                myMAP.draw_all();
        		$("#trackmap").val("Calibrate");
        		$("#calibline").html("calibration finished!");
		    	Clickmode = "setvideo";
	        }
            else { abort = true; }
			break;
		}
        if (abort)
        {
            $("#timeoffset").val("Calibrate");
       		$("#trackmap").val("Calibrate");
            $("#calibline").html("calibration aborted!");
            state = "";
            Clickmode = "setvideo";
        }
		Laststate = state;
	}
}
