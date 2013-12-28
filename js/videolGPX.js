// The VideOL javascript library
// Copyright: Andreas Dick
// License: GPLv2

// handling of GPX datas
VideolGPX = function(url)
{
    // setup track points
    var Track = { };
    
    $.get(url+'&jsonpcbf=?', function(data)
    {
        var earthR = 6371001;
        var timeref = data[0]['time'];
        var gpxlimits = { 'minlat': 100, 'minlon': 100, 'maxlat': -100, 'maxlon': -100 };
        var points = [ ];

        $.each(data, function(index, trkpnt)
        {
            var point = { };
            point.time = trkpnt.time - timeref;
            point.lat = trkpnt.lat;
            point.lon = trkpnt.lon * Math.cos(point.lat/180*Math.PI);
            point.ele = trkpnt.ele;
            point.sat = trkpnt.sat;
            points.push(point);
            
            gpxlimits.minlat = Math.min(gpxlimits.minlat,point.lat);
            gpxlimits.minlon = Math.min(gpxlimits.minlon,point.lon);
            gpxlimits.maxlat = Math.max(gpxlimits.maxlat,point.lat);
            gpxlimits.maxlon = Math.max(gpxlimits.maxlon,point.lon);
        });

        // calculate normalized coordinates
        var maplimits = myMAP.get_limits();
        var scaleX = (maplimits.maxX-maplimits.minX) / (gpxlimits.maxlon-gpxlimits.minlon);
        var scaleY = (maplimits.maxY-maplimits.minY) / (gpxlimits.maxlat-gpxlimits.minlat);
        var scale = Math.min(scaleX, scaleY);
        var mapofsX = (maplimits.maxX+maplimits.minX)/2 - (maplimits.maxX-maplimits.minX)/2*(scale/scaleX);
        var mapofsY = (maplimits.maxY+maplimits.minY)/2 + (maplimits.maxY-maplimits.minY)/2*(scale/scaleY);
        
        var indexes = { };
        $.each(points, function(index, point)
        {
            indexes[point.time] = index;
            point.x = +(scale*(point.lon - gpxlimits.minlon) + mapofsX);
            point.y = -(scale*(point.lat - gpxlimits.minlat) - mapofsY);
        });
        Track.points = points;
        Track.indexes = indexes;
        Track.earthR = earthR;
        
        // indicate loading finished
        myTRG.trigger('GPX');
    }, "json").fail(function() { alert('loading GPX file failed!'); });

    // returns the whole track
    this.get_track = function() { return Track; }

    // returns the point of a specific time
    this.get_point = function(time)
    {
        if (time < 0) time = 0;
        var point = Track.points[Track.indexes[time]];
        while ((point === undefined) && (time >= 0))
            point = Track.points[Track.indexes[time--]];
        return point;
    }
}
