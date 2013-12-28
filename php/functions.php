<?php
class Project
{
    public $access = false;
    public $project = "";
    public $cmd = "index";
    public $key = "";
    public $data = array();
    public $list = array();
    private $path = "projects/";
    private $file = "";
    public $fields = array
    (
        'title' => "Title of the Project",
        'date' => "Date of the Event (JJJJ-MM-DD)",
        'name' => "Name of the Runner",
        'videourls'=> "Video URL's (*.mp4,*.webm,*.ogv)",
        'trackurl' => "Track URL (*.gpx)",
        'mapurl' => "Map URL (*.jpg,*.png)",
    );

    function __construct($args)
    {
        if (preg_match('/^([^:,]+)/',$args,$matches))
        {
            $this->project = $matches[1];
            $this->file = $this->path.$this->project;
            $this->cmd = "videol";
        }
        if (preg_match('/:([^,]+)/',$args,$matches))
            $this->key = $matches[1];
        if (preg_match('/,(.+)$/',$args,$matches))
            $this->cmd = $matches[1];
        if ($this->cmd == "edit")
            $this->cmd = "videol";
        if ($this->cmd == "index")
            $this->file = $this->path.".masterkey";
    }

    function load()
    {
        if (is_file($this->file))
        {
            $json = file_get_contents($this->file);
            $data = json_decode($json,true);

            if (!isset($data['key'])) die("invalid project key!");
            $this->access = ($data['key'] == $this->key);
            foreach ($this->fields as $field => $name)
            {
                $this->data[$field] = (isset($data[$field])) ? $data[$field] : "";
            }
            $this->data['refdata'] = (isset($data['refdata'])) ? $data['refdata'] : "";
        }
        else $this->project = "";
    }

    function save($data)
    {
        if (!$this->access) die("invalid key!");

        $this->data['key'] = $this->key;
        foreach ($this->fields as $field => $name)
        {
            if (isset($data[$field]))
                $this->data[$field] = $data[$field];
        }
        if (isset($data['refdata'])) $this->data['refdata'] = $data['refdata'];
        
        $json = json_encode($this->data);
        file_put_contents($this->file, $json);
    }

    function create($data)
    {
        if (!$this->access) die("invalid access!");

        $this->data = array();
        if ($data['project'] && $data['key'])
        {
            $this->file = $this->path.$data['project'];
            if (is_file($this->file)) die("invalid project file!");

            $this->data['key'] = $data['key'];
            $this->data['date'] = date("Y-m-d");
            $json = json_encode($this->data);
            file_put_contents($this->file, $json);
        }
        $this->data['project'] = $data['project'];
    }
    
    function index()
    {
        if ($DIRH=@opendir($this->path))
        {
            while (($file = readdir($DIRH))!=false)
            {
                $path = $this->path.'/'.$file;
                if (preg_match("|^\.\.?$|",$file)) continue;
                if (($file == ".masterkey") || !is_file($path)) continue;
                
                $json = file_get_contents($path);
                $data = json_decode($json,true);
                $data['project'] = $file;
                if (!isset($data['title']) || !$data['title']) $data['title'] = $file;
                if (!isset($data['name'])) $data['name'] = "";
                $this->list[] = $data;
            }            
        }
        if ($this->list) uasort($this->list, "rsort_date");
        if (!isset($this->data['project'])) $this->data['project'] = '';
        if (!isset($this->data['key'])) $this->data['key'] = '';
    }
}    

function rsort_date($a,$b)
{
    if ($a['date'] == $b['date']) return 0;
    return ($a['date'] > $b['date']) ? -1 : 1;
}
?>