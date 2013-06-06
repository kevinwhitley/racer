var http = require("http");
var sio = require('socket.io');

exports.start = function(router, socketOnConnection) {
    var onRequestF = function onRequest(request, response) {
        router.route(request, response);
    };

    // start the http server
    var port = process.env.PORT || 8060;
    console.log('listening on port ' + port);
    var server = http.createServer(onRequestF).listen(port);

    if (socketOnConnection) {
        // also run the socket.io listener
        var socketServer = sio.listen(server);
        socketServer.sockets.on('connection', socketOnConnection);
    }
    
    console.log("Server has started.");
    
};
