var url = require("url");

function Router()
{
    this.routers = {};
    this.rootRouter = null;
}

exports.makeRouter = function()
{
    return new Router();
};

Router.prototype.add = function(path, filerouter)
{
    this.routers[path] = filerouter;
};

Router.prototype.setRootRouter = function(filerouter)
{
    this.rootRouter = filerouter;
};

Router.prototype.route = function(request, response)
{
    var pathname = url.parse(request.url).pathname;
    var servletName = '';
    if (pathname.length > 1) {
        servletName = pathname.substring(1);
        var slash = servletName.indexOf('/');
        if (slash >= 0) {
            servletName = servletName.substring(0, slash);
        }
    }
    var filerouter = this.routers[servletName];
    var path = null;
    if (filerouter) {
        path = pathname.substring(servletName.length+2);
    }
    else {
        filerouter = this.rootRouter;
        path = pathname.substring(1);
        servletName = 'ROOT';
    }

    //console.log('request for ' + pathname + ' to servlet ' + servletName + ' path ' + path);
    
    filerouter.route(this, path, response);
};

Router.prototype.respond404 = function(response)
{
    // failed to respond, give back a 404
    response.writeHead(404, { 'Content-Type': 'text/html' });
    response.end('not found');
};

