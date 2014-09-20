<?php
class Project
{
    public $access = false;
    public $project = "";
    public $cmd = "projects";
    public $key = "";
    public $settings = array();
    public $data = array();
    public $list = array();
    private $base = "projects/";
    public $fields = array
    (
        'title' => "Title of the Project",
        'date' => "Date of the Event (YYYY-MM-DD)",
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
            $this->cmd = "videol";
        }
        if (preg_match('/:([^,]+)/',$args,$matches))
            $this->key = $matches[1];
        if (preg_match('/,(.+)$/',$args,$matches))
            $this->cmd = $matches[1];
        if ($this->cmd == "edit")
            $this->cmd = "videol";
    }

    function settings()
    {
        $settings = $this->base."settings";
        if (is_file($settings))
        {
            $json = file_get_contents($settings);
            $data = json_decode(trim($json),true);

            if (isset($data['masterkey']))
                $this->access = ($data['masterkey'] == $this->key) ? true : $this->access;
            $this->settings = $data;
        }
    }

    function load()
    {
        if (is_file($this->base.$this->project))
        {
            $json = file_get_contents($this->base.$this->project);
            $data = json_decode($json,true);

            if (!isset($data['key'])) die("invalid project key!");
            $this->access = ($data['key'] == $this->key) ? true : $this->access;
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
        file_put_contents($this->base.$this->project, $json);
    }

    function create($data)
    {
        if (!$this->access) die("invalid access!");

        $this->data = array();
        if ($data['project'])
        {
            $this->project = $data['project'];
            if (is_file($this->base.$this->project)) die("invalid project file!");

            $this->data['key'] = substr(md5(date("Y-m-d-H-i-s")),-10);
            $this->data['date'] = date("Y-m-d");
            
            $this->data['name'] = $this->settings['default-name'];
            $this->data['videourls'] = $this->settings['default-videourls'].$this->project."/";
            $this->data['trackurl'] = $this->settings['default-trackurl'].$this->project."/";
            $this->data['mapurl'] = $this->settings['default-mapurl'].$this->project."/";
            
            $json = json_encode($this->data);
            file_put_contents($this->base.$this->project, $json);
        }
        $this->data['project'] = $data['project'];
    }
    
    function projects()
    {
        if ($DIRH=@opendir($this->base))
        {
            while (($file = readdir($DIRH))!=false)
            {
                if (preg_match("|^\.\.?$|",$file)) continue;
                if (($file == "settings") || !is_file($this->base.$file)) continue;
                
                $json = file_get_contents($this->base.$file);
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
