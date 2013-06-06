var server = require("./server");
var routerModule = require("./router");
var fileRouterModule = require("./filerouter");
var socketModule = require("./socketListener");

var application = require("./racer/racerServer").makeRacerServer();

var router = routerModule.makeRouter();
//router.add('cl', fileRouterModule.makeFileRouter('/Users/kevin/zkevins/program/trunk/website/cl/'));
//router.add('statik', fileRouterModule.makeFileRouter('/Users/kevin/zkevins/program/trunk/ksw/media/statik/'));
//router.add('tests', fileRouterModule.makeFileRouter('/Users/kevin/zkevins/program/trunk/tests/'));

//router.setRootRouter(fileRouterModule.makeFileRouter('/Users/kevin/zkevins/program/trunk/htwebsite/v2/'));
//router.setRootRouter(fileRouterModule.makeFileRouter('/Users/kevin/zkevins/program/trynode/'));
router.setRootRouter(fileRouterModule.makeFileRouter('./'));

socketModule.setApplication(application);
server.start(router, socketModule.onConnection);
application.begin();
