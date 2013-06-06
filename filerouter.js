
var fs = require("fs");
var url = require("url");

function FileRouter(rootpath)
{
    this.rootpath = rootpath;
}

exports.makeFileRouter = function(rootpath) {
    return new FileRouter(rootpath);
};

FileRouter.prototype.route = function(router, pathname, response) {
    if (!pathname) {
        pathname = 'index.html';
    }
    
    pathname = this.rootpath + pathname;

    //console.log("Request for " + pathname + " received.");
    
    var self = this;
    
    // read files and send them raw
    fs.readFile(pathname, function (error, data) {
        if (error) {
            //console.log('error reading file: ' + error);
            router.respond404(response);
        }
        else {
            // Write headers.
            response.writeHead(200, { 'Content-Type': self.mimeType(pathname) });
            response.end(data);
        }
    });
};

FileRouter.MIME = {
    css: 'text/css',
    html: 'text/html',
    js: 'text/javascript',
    jpeg: 'image/jpeg',
    jpg: 'image/jpeg',
    png: 'image/png'
};

FileRouter.prototype.mimeType = function(pathname)
{
    var mime = null;
    var dot = pathname ? pathname.lastIndexOf('.') : -1;
    if (dot > 0) {
        var suffix = pathname.substring(dot+1).toLowerCase();
        mime = FileRouter.MIME[suffix];
    }
    return mime ? mime : 'text/plain';
};


