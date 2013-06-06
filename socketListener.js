
var SocketListener = {
    app: null,
    onConnection: function(socket) {
        var app = SocketListener.app;
        app.addSocket(socket);
    }
};


function SocketListener()
{
    this.app = null;
}

exports.setApplication = function(application) {
    SocketListener.app = application;
};
exports.onConnection = SocketListener.onConnection;

