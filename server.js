var http = require('http');
var url = require('url');
var fs = require('fs');
var path = require('path');
var mime = require('./mime.js');
var config = require('./config.js');

var server = http.createServer(function(req,res){
  var pathname = url.parse(req.url).pathname;
  if (pathname === '/') {
    var absPath =  'D://assets'+pathname+'index.html';
  } else{
    var absPath = path.join('D:\/assets',path.normalize(pathname.replace(/\.\./g,"")));    
  }
  fs.exists(absPath,function(exists){
    if (exists) {
      var extName = path.extname(absPath);  // 获得文件后缀名
      extName = extName?extName.slice(1):'unknown';
      var contentType = mime.types[extName] || 'text/plain';
      if (extName.match(config.Expires.fileMatch)) {
        var expires = new Date();
        expires.setTime(expires.getTime() + config.Expires.maxAge * 1000);
        res.setHeader('Expires',expires.toUTCString());
        res.setHeader('Cache_Control','max-age=' + config.Expires.maxAge);
      }
      fs.stat(absPath,function(err,stat){
        var lastModified = stat.mtime.toUTCString();
        res.setHeader('Last-Modified',lastModified);
      });
      if (req.headers['If-Modified-Since'] && lastModified == req.headers['If-Modified-Since']) {
        res.writeHead(304,"Not Modified");
        res.end();
      } else {
        fs.readFile(absPath,'binary',function(err,file){
          if (err) {
            res.writeHead(500,{
              'Content-Type' : 'text/plain'
            });
            res.end(err);
          } else {
            res.writeHead(200,{
              'Content-Type' : contentType
            });
            res.write(file,'binary');
            res.end();
          }
        });
      }
    } else {
      res.writeHead(404,{
        'Content-Type' : 'text/html'
      });
      res.write("<h1>ERROR 404 FILE NOT FOUND</h1>");
      res.end();
    }
  });
});
server.listen(8000);
console.log("正在监听localhost:8000");
