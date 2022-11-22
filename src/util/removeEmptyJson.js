
import jdata from '../assets/julia-r.json' assert { type: "json" };
let wd = [];
var data = JSON.parse(JSON.stringify(jdata))

var newdata = {};
var i=0
for( var d in jdata){


        var key =d;
        var val = jdata[key];
        // console.log(key,val);
    
        if(val.verts!=null)
        {
            let tmp = {};
            tmp[key]=val;
            newdata[key] = val;
        }

    
}


import * as fs from 'fs';
const jsonContent = JSON.stringify(newdata);

fs.writeFile("./julia-r-cleaned.json", jsonContent, 'utf8', function (err) {
    if (err) {
        return console.log(err);
    }

    console.log("The file was saved!");
}); 