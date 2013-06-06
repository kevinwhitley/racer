
/*
messages to client:

  socket.emit('gameState', this.race.getExternalObject());
  socketSession.emit('youare', externalPlayer);
  this.server.broadcast('playerInfo', player.getExternalObject());
  this.server.broadcast('playerReady', playerId);
  this.server.broadcast('beginRace', this.whoseTurn.id);
  this.server.broadcast('didTurn', {player: player.id,
                         position: player.position, whoseTurn: nextPlayer.id});


messages to server:
    socket.on('playerJoin', function(playerName) {
    socket.on('playerReady', function(playerId){
    socket.on('roll', function(playerId){

 */

function RacerServer()
{
    this.name = 'Racer100';
    this.sessions = [];
    this.race = new Race(this);  // make sure the race object is in place before any connections
    // create a fake player for the race
    //this.race.addPlayer('alfred', null);
}

exports.makeRacerServer = function() {
    return new RacerServer();
};

RacerServer.prototype.addSocket = function(socket)
{
    console.log('adding socket');
    
    // remember this socket
    var session = new SocketSession(socket);
    this.sessions.push(session);

    var self = this;
    
    // listen for various messages from socket
    
    // we allow anybody to join, just by sending us a name
    socket.on('playerJoin', function(playerName) {
        self.race.addPlayer(playerName, self._findSession(socket));
        console.log('player ' + playerName + ' joined');
    });
    socket.on('playerReady', function(playerId){
        console.log('playerReady message from ' + playerId);
        session = self._findSession(socket, playerId);
        if (session) {
            self.race.playerReady(playerId, session);
        }
        else {
            console.log('no session?');
        }
    });
    socket.on('roll', function(playerId){
        console.log('roll from ' + playerId);
        session = self._findSession(socket, playerId);
        if (session) {
            self.race.roll(playerId, session);
        }
    });

    // send initial game state to the socket
    console.log('sending gameState');
    socket.emit('gameState', this.race.getExternalObject());
    console.log('sent');
};

// find the session for a socket, and validate that it is associated with the expected playerId 
RacerServer.prototype._findSession = function(socket, playerId)
{
    var ii;
    for (ii=0; ii<this.sessions.length; ii++) {
        if (this.sessions[ii].socket == socket) {
            return (this.sessions[ii].playerId == playerId) ? this.sessions[ii] : null;
        }
    }
    return null;
};

RacerServer.prototype.broadcast = function(msg, data)
{
    var nSessions = this.sessions.length;
    var ii;
    for (ii=0; ii<nSessions; ii++) {
        this.sessions[ii].socket.emit(msg, data);
    }
};

RacerServer.prototype.begin = function()
{
    /*
    var inv = null;
    var count = 0;
    var self = this;
    inv = setInterval(function(){
        if (self.sessions.length > 0) {
            count++;
            //console.log('Count: ' + count);
            //self.broadcast('count', {count: count});
            self.broadcast('gameEvent', self.randomEvent());
            if (count >= 10) {
                clearInterval(inv);
            }
        }
    }, 1000);
    */
};

RacerServer.ids = [1, 3, 8, 17];

RacerServer.prototype.randomEvent = function()
{
    // 1/2 chance of a turn
    var type = '', value = 0;
    if (Math.random() < 0.5) {
        type = 'turn';
    }
    else {
        type = 'movedTo';
        value = Math.floor(Math.random()*500) + 4;
    }
    var idIndex = Math.floor(Math.random()*RacerServer.ids.length);
    var playerId = RacerServer.ids[idIndex];
    
    return {type: type, playerId: playerId, value: value};
};

function SocketSession(socket)
{
    this.socket = socket;
    this.playerId = null;
}

SocketSession.prototype.emit = function(msg, data)
{
    this.socket.emit(msg, data);
};

// send a message to all *other* sockets
SocketSession.prototype.emitToAllOthers = function(msg, data)
{
    this.socket.broadcast.emit(msg, data);
};

function RacePlayer()
{
    this.name = '??';
    this.ready = false;
    this.index = 0;  // vertical position in race display (order of addition to race)
    this.id = 0;    // unique identifier
    this.token = null;
    this.position = 0;
}

RacePlayer.prototype.getExternalObject = function()
{
    return {
        name: this.name,
        ready: this.ready,
        index: this.index,
        id: this.id,
        token: this.token,
        position: this.position
    };
};

function Race(server)
{
    this.server = server;
    this.players = [];
    this.started = false;
    this.finished = false;
    this.whoseTurn = null;
}
Race.Tokens = ['red', 'blue', 'yellow', 'black', 'white', 'green'];

Race.prototype.addPlayer = function(name, socketSession)
{
    // create and add the player
    var player = new RacePlayer();
    player.name = name;
    player.index = this.players.length+1;
    player.id = this.players.length * 10;
    player.token = Race.Tokens[this.players.length];
    this.players.push(player);
    
    // mark the socket session with this player's id
    if (socketSession) {
        socketSession.playerId = player.id;
        
        // tell the client who they are
        var externalPlayer = player.getExternalObject();
        socketSession.emit('youare', externalPlayer);
        // tell all other clients about the new player
        socketSession.emitToAllOthers('playerInfo', externalPlayer);
    }
};

Race.prototype._findPlayer = function(playerId)
{
    var ii;
    for (ii=0; ii<this.players.length; ii++) {
        if (this.players[ii].id == playerId) {
            return this.players[ii];
        }
    }
    return null;
};

// find the next player (modulo the array) after the player with the given id
Race.prototype._nextPlayer = function(playerId)
{
    var ii;
    for (ii=0; ii<this.players.length; ii++) {
        if (this.players[ii].id == playerId) {
            return this.players[(ii+1)%this.players.length];
        }
    }
    return null;
};

Race.prototype.playerReady = function(playerId, socketSession)
{
    console.log('playerReady ' + playerId);
    var player = this._findPlayer(playerId);
    if (player) {
        console.log('-- ' + player.name);
        player.ready = true;
        // tell all clients that this player is ready
        this.server.broadcast('playerReady', playerId);
    }
    
    // the race begins if we have more than one player and all players are ready
    var ii=0;
    var nReady = 0;
    for (ii=0; ii<this.players.length; ii++) {
        nReady += this.players[ii].ready ? 1 : 0;
    }
    if (nReady > 1 && nReady == this.players.length) {
        // start the race
        this.whoseTurn = this.players[0];
        this.server.broadcast('beginRace', this.whoseTurn.id);
    }
};

Race.prototype.roll = function(playerId, socketSession)
{
    var player = this._findPlayer(playerId);
    if (player) {
        if (player !== this.whoseTurn) {
            console.log('hey! wrong player! ' + this.whoseTurn.name);
        }
        else {
            // roll two dice and move player
            var roll = Math.floor(Math.random()*6) + Math.floor(Math.random()*6) + 2;
            player.position += roll;
            // whose turn is it now?
            this.whoseTurn = this._nextPlayer(player.id);
            
            // tell all the clients
            this.server.broadcast('didTurn', {player: player.id, position: player.position, whoseTurn: this.whoseTurn.id});
        }
    }
};

Race.prototype.getExternalObject = function()
{
    var externalPlayers = [];
    var ii;
    for (ii=0; ii<this.players.length; ii++) {
        externalPlayers.push(this.players[ii].getExternalObject());
    }
    return {
        players: externalPlayers,
        started: this.started,
        finished: this.finished,
        whoseTurn: this.whoseTurn ? this.whoseTurn.id : null
    };
};





