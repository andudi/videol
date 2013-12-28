// The VideOL javascript library
// Copyright: Andreas Dick
// License: GPLv2

// handling of triggers and events
VideolTRG = function()
{
    var Trigger = { };
    this.trigger = function(source)
    {
        console.log('trigger: '+source);
        Trigger[source] = true;
        
        var status = 'TRG: '; status += (Trigger['TRG'])?'ready':'loading';
        status += ', REF: '; status += (Trigger['REF'])?'ready':'loading';
        status += ', GPX: '; status += (Trigger['GPX'])?'ready':'loading';
        status += ', MAP: '; status += (Trigger['MAP'])?'ready':'loading';
        status += ', VID: ' ; status +=(Trigger['VID'])?'ready':'loading';
        $("#statusline").html(status);
        
        if (Trigger['REF'] && Trigger['VID'] && !Trigger['videol_video'])
        {
            Trigger['videol_video'] = true;
            $(document).trigger('videol_video');
        }
        if (Trigger['REF'] && Trigger['MAP'] && Trigger['GPX'] && !Trigger['videol_map'])
        {
            Trigger['videol_map'] = true;
            $(document).trigger('videol_map');
        }
    }

    // setup video when ready
    $(document).on('videol_video', function()
    {
        myVID.init_time();
        console.log("video ready!");
    });

    // setup map when ready
    $(document).on('videol_map', function()
    {
        myVID.init_time();
        myMAP.init_map();
        console.log("map ready!");
    });
    
    // setup key event handler
    $(document).keydown(function(event)
    {
        // video events
        if (Trigger['videol_video'])
        {
            switch (event.which)
            {
                case 32:    myVID.toggle_video(); break;
                case 78:    myVID.step_time(+1); break;
                case 80:    myVID.step_time(-1); break;
                case 33:    myVID.step_time(+10); break;
                case 34:    myVID.step_time(-10); break;
                case 106:   myVID.step_time(+60); break;
                case 111:   myVID.step_time(-60); break;
                case 36:    myVID.init_time(); break;
            }
        }
        if (Trigger['videol_map'])
        {
            switch (event.which)
            {
                case 107:   myMAP.zoom_map(+1); break;
                case 109:   myMAP.zoom_map(-1); break;
                case 37:    myMAP.step_map(-1,0); break;
                case 38:    myMAP.step_map(0,+1); break;
                case 39:    myMAP.step_map(+1,0); break;
                case 40:    myMAP.step_map(0,-1); break;
                case 13:    myMAP.next_movemode(); break;
                case 8:     myMAP.reset_map(); break;
                case 36:    myMAP.init_map(); break;
            }
        }
    });
    
    var Mouse = { 'active': false, 'posX': 0, 'posY': 0 };
    $("#canvas").on("mousedown", function(event)
    {
        if (event.which == 1)
        {
            Mouse.active = true;
            Mouse.moved = false;
            Mouse.posX = event.pageX;
            Mouse.posY = event.pageY;
        }
    });
    $("#canvas").on("mouseup mouseleave", function(event)
    {
        if ((event.which == 1) && Mouse.active)
        {
            Mouse.active = false;
            if (Mouse.moved) myMAP.step_map(0,0);
        }
    });
    $("#canvas").on("mousemove", function(event)
    {
        if (Mouse.active && (Math.abs(event.pageX-Mouse.posX)>5 || Math.abs(event.pageY-Mouse.posY)>5))
        {
            myMAP.move_map(event.pageX-Mouse.posX, event.pageY-Mouse.posY);
            Mouse.moved = true;
            Mouse.posX = event.pageX;
            Mouse.posY = event.pageY;
        }    
    });
    $("#canvas").on("dblclick", function(event)
    {
        myVID.toggle_video();
    });
    $("#canvas").on("mousewheel", function(event, delta)
    {
        if (delta > 0) myMAP.zoom_map(+1);
        else if (delta < 0) myMAP.zoom_map(-1);
        return false;
    });
    $("#player").on("mousewheel", function(event, delta)
    {
        if (delta > 0) myVID.step_time(+1);
        else if (delta < 0) myVID.step_time(-1);
        return false;
    });

    // dummy trigger for status init
    this.trigger('TRG');
}
