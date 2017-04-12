// server.js
// load the things we need
var express = require('express');
var app = express();
var fs = require("fs");
var path = require('path');


var fileName = "foo.txt";
var dirName = "data";
var mydata = "";
var subtasks = 0;
var subdirs = [];
var files = [];
function f_stats_complete (res, subdirs, files) {
console.log ('stats complete');
console.log ('subdirs=' + subdirs);
console.log ('files=' + files);
res.send('?subdirs='+subdirs+'&files='+files);
}
function createCallback (_fullpath, _res) {
  return function (err, stats) { 	
    console.log('fs.stat complete for '+_fullpath);
    if (err) {
      console.log('fs.stat err='+err);    
    } else if (stats.isDirectory()) {
      subdirs.push(_fullpath);
    } else if (stats.isFile()) {
      files.push(_fullpath);
    }
    if (--subtasks === 0) {
      f_stats_complete (_res, subdirs, files);
    }
  }  
}
function ascii_to_hexa(str)  
  {  
    var arr1 = [];  
    for (var n = 0, l = str.length; n < l; n ++)   
     {  
        var hex = Number(str.charCodeAt(n)).toString(16);  
	if (hex.length < 2) hex='0'+ hex;
        arr1.push(hex);  
     }  
    return arr1.join('');  
   }  
app.set('port', (process.env.PORT || 5000));

// set the view engine to ejs
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

app.get('/xhr-write', function(req, res){
  console.log('xhr-write invoked');
  fileName=req.query.filename;
  console.log('fileName='+fileName);
  mydata=req.query.mydata;
  console.log('mydata='+mydata);
  fs.open(__dirname+path.sep+'data'+path.sep+fileName, 'w', (err,fd) => {
    if (err) throw err;
    mydata = mydata.replace(/[\r]/gm,'');
    fs.writeFile(fd, mydata, (err, data) => {
      if (err) throw err;
      console.log('written: '+mydata);
      fs.close(fd, (err) => {
        if (err) throw err;
      });
      res.send('written successfully');
    });
  });
});
app.get('/xhr-read', function(req, res){
  console.log('xhr-read invoked');
  fileName=req.query.filename;
  console.log('fileName='+fileName);
  fs.open(fileName, 'r', (err,fd) => {
    if (err) throw err;
    fs.readFile(fd, (err, data) => {
      if (err) throw err;
      mydata = data.toString();
      console.log('read: '+mydata);
      fs.close(fd, (err) => {
        if (err) throw err;
      });
      //mydata = mydata.replace(/[\n]/gm,'<br>');
      res.send(mydata);
    });
  });
});

app.get ('/xhr-readdir', function(req,res){
  console.log('xhr-readdir invoked');
  if (req.query.dirname) { 
    dirName=req.query.dirname;
    console.log ('typeof dirName='+typeof dirName);
    console.log('dirName='+dirName);
    subdirs=[];
    files=[];
    fs.readdir(dirName, (err,data) => {
      if (err) { 
        if (err.code === 'ENOENT'){
	  res.send('error=ENOENT')      
        } else {
	  console.log('error='+err)
          res.send('error='+err);	      
        // throw err;
        }
      } else {
	console.log('data is array='+Array.isArray(data));
	console.log('path.sep='+path.sep);
	var arrLength=data.length;
	subtasks = arrLength;
	for (var i =0; i < arrLength; i++) {
          var fullpath=dirName+path.sep+data[i];
	  console.log (i + ' ' + fullpath);
	  var stats = null;
	  fs.stat(fullpath, createCallback (fullpath, res));
	}
      }
    });
  } else {
    res.send('error=dirname missing from xhr-readdir parameters');
    console.log('error=dirname missing from xhr-readdir parameters');
  }
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

