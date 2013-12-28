<?php
    // validate request
    if (!isset($_GET['file'])) die("invalid argument");
    if (preg_match('/\.\./',$_GET['file'])) die("invalid filename");
    if (!preg_match('/\.gpx$/',$_GET['file'])) die("invalid filename");
    if (!file_exists($_GET['file'])) die("invalid file");
    if (!isset($_GET['jsonpcbf'])) die("invalid callback function");
    
    // read gpx file as xml string
    $gpx = file_get_contents($_GET['file']);
    $xml = simplexml_load_string($gpx);
    
    // parse xml string for requested fields
    $data = array();
    foreach ($xml->trk->trkseg[0] as $val)
    {
        $data[] = array
        (
            'time'  => strtotime((string)$val->time),
            'lon'   => (float)$val->attributes()->lon,
            'lat'   => (float)$val->attributes()->lat,
            'ele'   => (float)$val->ele,
            'sat'   => (int)$val->sat,
        );
    }
    
    // return data as jsonp callback function
    print $_GET['jsonpcbf'].'('.json_encode($data).')';
?>