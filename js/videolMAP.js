// The VideOL javascript library
// Copyright: Andreas Dick
// License: GPLv2

// handling of the map and the overlay draws
VideolMAP = function(mapurl)
{
    // setup canvas area
    var Paper = new paper.PaperScope();
    Paper.setup('canvas');
    
    with (Paper)
    {
        // create a map and an image object for preloading
        var Map, Img = new Image();
        Img.src = mapurl;
        Img.onload = function()
        {
            // load the image to the map object
            Map = new Raster(mapurl, Center);
            Map.sendToBack();
            Map.onClick = Mouse.MapClick;

            // indicate loading finished
            myTRG.trigger('MAP');
        }
        
        // define some map boundaries
        var Size = { 'x': 640, 'y': 360, };
        var Center = { 'x': Size.x/2, 'y': Size.y/2 };
        var Limits =
        {
            'minX': Size.x/2-300, 'maxX': Size.x/2+300,
            'minY': Size.y/2-160, 'maxY': Size.y/2+160,
        };
        this.get_limits = function() { return Limits; }
        this.get_mapdata = function(mapdata)
        {
            var angle = Map.matrix.rotation;
            var position = Map.position.clone().rotate(-angle, Center);
            switch (mapdata)
            {
                case 'mapposx': return Math.round(position.x);
                case 'mapposy': return Math.round(position.y);
                case 'mapscale': return Math.round(Map.matrix.scaling.x*100)/100;
                case 'mapangle': return Math.round(angle*100)/100;
                default: return;
            }
        }
        
        // handle move modes
        var Movemode = 0;
        this.get_movemode = function() { return Movemode; }
        this.set_movemode = function(mode)
        {
            if (mode > 2) mode = 0;
            if (myREF.is_trackmap()) Movemode = mode;
            else Movemode = 0;

            switch (Movemode)
            {
                case 0: $("#movemode").val("Static"); break;
                case 1: $("#movemode").val("Follow"); break;
                case 2: $("#movemode").val("Squirrel"); break;
            }
        }
        this.next_movemode = function()
        {
            myMAP.set_movemode(Movemode + 1)
            myMAP.update_map(true);
        }

        // map handling
        this.init_map = function()
        {
            Map.transform(Map.matrix.clone().inverted());
            Map.translate(myREF.get_configs().mapposx, myREF.get_configs().mapposy);
            Map.scale(myREF.get_configs().mapscale);
            Map.rotate(myREF.get_configs().mapangle, Center);
            myMAP.set_movemode(myREF.get_configs().movemode);

            myMAP.load_trackmap();
            myMAP.draw_all();
        }
        this.reset_map = function()
        {
            Map.transform(Map.matrix.clone().inverted());
            Map.translate(Center);
            Map.scale(myREF.get_configs().iniscale);
            myMAP.set_movemode(0);

            myMAP.draw_all();
        }
        this.zoom_map = function(zoom)
        {
            var factor = 1.6;
            var scale = (zoom > 0) ? factor : 1/factor;
            Map.scale(scale, Center);

            if (!myREF.is_trackmap()) myMAP.load_trackmap();
            myMAP.draw_all();
        }
        this.step_map = function(dirX, dirY)
        {
            if (myMAP.get_movemode() > 1) return;
            
            var factor = 0.3;
            var move = new Point(Math.round(-dirX*factor*Size.x), Math.round(+dirY*factor*Size.y));
            Map.translate(move);
            
            if (!myREF.is_trackmap()) myMAP.load_trackmap();
            myMAP.draw_all();
            myMAP.set_movemode(0);
        }
        this.move_map = function(moveX, moveY)
        {
            if (myMAP.get_movemode() > 1) return;
            
            var move = new Point(moveX, moveY);
            Map.translate(move);
            Track.translate(move);
            Pointer.translate(move);
            Refpoints.translate(move);
            Paper.view.draw();
        }
        this.update_map = function(force)
        {
            var time = myVID.get_time() + myREF.get_timeoffset();
            var point = myGPX.get_point(time);
            var position = Map.matrix.clone().concatenate(Trackmap).transform(point);

            if (myMAP.get_movemode() >= 1)
            {
                // move map
                move = new Point(Center.x-position.x, Center.y-position.y);
                Map.translate(move);

                // move track
                if (Map.data.updated === undefined) Map.data.updated = 0;
                else Map.data.updated += Math.abs(move.x) + Math.abs(move.y);
                if (Map.data.updated > 50)
                {
                    myMAP.draw_track();
                    myMAP.draw_refpoints();
                    Map.data.updated = 0;
                }
                else
                {
                    Track.translate(move);
                    Refpoints.translate(move);
                }
            }

            var angle = -Map.matrix.rotation;
            if (myMAP.get_movemode() == 2)
            {
                // rotate map and track
                angle -= Pointers[point.time].angle;
                while (angle < -180) angle += 360;
                while (angle > 180) angle -= 360;
                if (!force) angle *= 0.4;
            }
            Map.rotate(angle, Center);
            Track.rotate(angle, Center);
            Refpoints.rotate(angle, Center);

            // update pointer
            myMAP.draw_pointer();
        }

        // load the trackmap transformation
        Trackmap = { };
        this.load_trackmap = function()
        {
            if (myREF.is_trackmap())
            {
                var tm = myREF.get_trackmap();
                Trackmap = new Matrix(tm.a,tm.c,tm.b,tm.d,tm.tx,tm.ty);
            }
            else
            {
                Trackmap = Map.matrix.clone().inverted();
            }
        }   
        
        // draw track, refpoints and pointer
        this.draw_all = function()
        {
            myMAP.draw_track();
            myMAP.draw_refpoints();
            myMAP.draw_pointer();
        }

        Track = new Group();
        Pointers = [ ];
        this.draw_track = function()
        {
            console.log("draw track...");

            Track.removeChildren();
            
            var track = myGPX.get_track();
            var invmap = Map.matrix.clone().concatenate(Trackmap).inverted();
            var filter = myREF.get_configs().filter * invmap.scaling.x;
            var limit = Path.Circle(Center, Size.x/2+Size.y/2).transform(invmap);

            var hidden = true;
            var pnt1, norm1, last = track.points[0];
            $.each(track.points, function(index, point)
            {
                // filter out start-end limit
                if (myREF.get_configs().endtime && (point.time > myREF.get_configs().endtime) ||
                    (point.time < myREF.get_configs().starttime))
                    last = point;

                // filter out close points
                else if ((Math.abs(last.x-point.x)>filter) || (Math.abs(last.y-point.y)>filter))
                {
                    // filter out hidden points
                    if (!limit.contains(point)) hidden = true;
                    else
                    {
                        var norm2 = Trackmap.clone().transform(point);
                        var pnt2 = Map.matrix.clone().transform(norm2);

                        // skip point if last was hidden
                        if (hidden)
                        {
                            hidden = false;
                            norm1 = Trackmap.clone().transform(last);
                            pnt1 = Map.matrix.clone().transform(norm1);
                        }
                        else
                        {
                            var vect = new Point(norm2.x-norm1.x, norm2.y-norm1.y);
                            var dist = new Point(last.lon-point.lon, last.lat-point.lat);
                            var speed = Math.sin(Math.PI/180*dist.length)*track.earthR / (point.time-last.time)*3.6;
                            var color = myREF.get_speedcolor(speed);
                            var pointer =
                            { 
                                'angle': vect.angle+90,
                                'speed': speed,
                                'color': color,
                            };
                            for (var time = last.time; time<=point.time; time++)
                                Pointers[time] = pointer;

                            var trackline = new Path.Line(
                            {
                                'from': pnt1, 'to': pnt2, 
                                'strokeColor': color, 'strokeWidth': 3, 'strokeCap': 'round',
                            });
                            Track.addChild(trackline);
                            var trackpoint = new Path.Circle(
                            {
                                'center': [pnt1.x,pnt1.y], 'radius': 5,
                                'fillColor': "#000", 'opacity': 0,
                                'data': { 'time': last.time },
                                'onMouseEnter': Mouse.enter,
                                'onMouseLeave': Mouse.leave,
                                'onMouseDown': Mouse.click,
                            });
                            Track.addChild(trackpoint);
                            
                            norm1 = norm2;
                            pnt1 = pnt2;
                        }
                    }
                    last = point;
                }
            });
            Track.bringToFront();
            console.log(Track.children.length+' trackpoints drawn');
        }


        // track mouse events
        var Mouse = { };
        Mouse.enter = function(event)
        {
            var trackpoint = event.target;
            trackpoint.opacity = 1;
            trackpoint.bringToFront();
        }
        Mouse.leave = function(event)
        {
            var trackpoint = event.target;
            trackpoint.opacity = 0;
        }
        Mouse.click = function(event)
        {
            var time = event.target.data.time;
            var point = myGPX.get_point(time);
            position = { 'x': Math.round(point.x), 'y': Math.round(point.y) };
            switch (myREF.get_clickmode())
            {
            case "setvideo":
                console.log('track('+time+'): '+position.x+','+position.y);
                myVID.set_time(time-myREF.get_timeoffset());
                break;
            case "timeoffset":
                myREF.set_timeoffset(time-myVID.get_time());
                myREF.ctrl_calibration("timeoffset_end");
                break;
            case "trackref":
                myREF.set_trackref(position);
                myREF.ctrl_calibration("trackmap_track");
                break;
            default:
                alert('Please click on the map!');
                break;
            }
        }
        Mouse.MapClick = function(event)
        {
            var position = Map.matrix.inverted().transform(event.point);
            position = { 'x': Math.round(position.x), 'y': Math.round(position.y) };
            switch (myREF.get_clickmode())
            {
            case "setvideo":
                console.log('map: '+position.x+','+position.y);
                break;
            case "mapref":
                myREF.set_mapref(position);
                myREF.ctrl_calibration("trackmap_map");
                break;
            default:
                alert('Please click on the track!');
                break;
            }
        }

        // draw the point on the track
        var Pointer = new Path.Circle(
        {
            'center': [0,0], 'radius': 5, 'fillColor': new Color(0,0,0,0),
        });
        this.draw_pointer = function()
        {
            // get point and position of the track pointer
            var time = myVID.get_time() + myREF.get_timeoffset();
            var point = myGPX.get_point(time);
            var mapping = Map.matrix.clone().concatenate(Trackmap);

            // update pointer data
            Pointer.position = mapping.transform(point);
            if (Pointers[point.time] !== undefined)
            {
                Pointer.data.angle = Pointers[point.time].angle;
                Pointer.fillColor = Pointers[point.time].color;
            }
            else
            {
                Pointer.data.angle = 0;
                Pointer.fillColor = "#fff"; // white
            }
            Pointer.bringToFront();
            Paper.view.draw();

            // update status lines
            var min = Math.floor(point.time/60);
            var sec = point.time % 60;
            var fill = (sec < 10) ? '0' : '';
            if (Pointers[point.time] !== undefined)
            {
                $("#statusline").html(min+'m'+fill+sec+'s, '+
                    Math.round(Pointers[point.time].speed*10)/10+'km/h, '+
                    Math.round(Pointers[point.time].angle)+'°, '+
                    point.ele+'müM, '+point.sat+'sat');
            }
            else
            {
                $("#statusline").html(min+'m'+fill+sec+'s, '+
                    point.ele+'müM, '+point.sat+'sat');
            }
            
        }

        // draw the reference points on map and track
        Refpoints = new Group();
        this.draw_refpoints = function()
        {
            if (!myREF.is_access()) return;
            
            Refpoints.removeChildren();
            var refpoints = myREF.get_refpoints();
            $.each(refpoints, function(index,position)
            {
                var refpoint = Pointer.clone();
                refpoint.position = Map.matrix.transform(position);
                refpoint.fillColor = 'black';
                refpoint.bringToFront();
                Refpoints.addChild(refpoint);
            });
            Refpoints.bringToFront();
        }
    }
}
