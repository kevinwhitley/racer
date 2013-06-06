
Ember.Application.initializer({
    name: 'racer',
    
    initialize: function(container, application) {
        console.log('racer initialize');
        application.theRace = application.BuildRace();

        var serverS = window.location.protocol + '//' + document.domain;
        console.log('connect to '  + serverS);
        var socket = io.connect(serverS, {
            // reconnect config needed for ipad - otherwise connection is just dropped
            reconnect: true,
            'reconnection delay': 500,
            'max reconnection attempts': 3
        });
        console.log('connected: ' + socket);
        application.theRace.socket = socket;
        
        socket.on('gameState', function(gameState) {
            application.theRace.stateFromServer(gameState);
        });
        // we are added to game (acknowledgement from server)
        socket.on('youare', function(playerInfo) {
            application.theRace.weHaveJoined(playerInfo);
        });
        // other player added to game
        socket.on('playerInfo', function(playerInfo) {
            application.theRace.playerJoined(playerInfo);
        });
        // a player is ready (including us) - and acknowledged by server
        socket.on('playerReady', function(playerId) {
            application.theRace.serverReady(playerId);
        });
        // the race is starting
        socket.on('beginRace', function(startingPlayerId) {
            application.theRace.beginRace(startingPlayerId);
        });
        // a turn was taken
        socket.on('didTurn', function(turnData) {
            application.theRace.didTurn(turnData);
        });
       /*
        socket.on('gameEvent', function (data) {
            application.theRace.eventFromServer(data);
        });
        socket.on('news', function(data) {
            socket.emit('my other event', { my: 'data' });
        });
        socket.on('count', function(data) {
            console.log('count: ' + data.count);
        });
        */
    }
});

App = Ember.Application.create({
    ready: function() {
        console.log('app ready');
    }
});

App.ApplicationController = Ember.Controller.extend({
    reset: function() {
        console.log('calling reset');
    }
});

App.Router.map(function() {
	// put your routes here
	// (the index route, for the / path, is automatically inserted)
	this.route('about');
	this.route('race');
});

App.IndexRoute = Ember.Route.extend({
	model: function() {
	    var race = App.theRace;
	    //runEventStream(race);
	    return race;
	},
	setupController: function(controller, model) {
	    this._super(controller, model);
	    // hack! remember the index controller so that we can use it to do a transition
	    App.myIndexController = controller;
	}
});

App.IndexController = Ember.ObjectController.extend({
    playerName: 'nn',
    otherPlayers: function() {
        return this.get('players').without(this.get('viewingPlayer'));
    }.property('players.@each.name', 'viewingPlayer'),
    setName: function() {
        App.theRace.createPlayerName(this.get('playerName'));
    },
    makeReady: function() {
        App.theRace.clickReady();
    }
});

App.RaceRoute = Ember.Route.extend({
    model: function() {
        return App.theRace;
    }
});

App.RaceController = Ember.ObjectController.extend({
    roll: function() {
        App.theRace.roll();
    }
});

App.GameHistoryController = Ember.ObjectController.extend({});

App.PlayerTokenController = Ember.ObjectController.extend({
    displayStyle: function() {
        return 'background-color: ' + this.get('token');
    }.property('token')
});

App.PlayerOnTrackController = Ember.ObjectController.extend({
    tokenStyle: function() {
        return 'top: ' + this.get('index')*30 + 'px;left:' + this.get('position')*5 + 'px';
    }.property('position')
});

App.Player = Ember.Object.extend({
    id: 0,
	name: '??',
	token: 'default',
	position: 0,
	ready: false
});

/*
App.PlayerData = [
    {id: 1, name: 'Alfred', token: 'red', index: 1, position: 20},
    {id: 3, name: 'Betty', token: 'blue', index: 2, position: 50},
    {id: 8, name: 'Charles', token: 'yellow', index: 3, position: 30},
    {id: 17, name: 'Diane', token: 'black', index: 4, position: 80}
];
*/

App.Race = Ember.Object.extend({
	players: [],
	whoseTurn: null,
	viewingPlayer: null,
	started: false,
	finished: false,
	history: [],
	name: 'hey',
	socket: null,
	
	fakeEvent: function() {
	    console.log('fake server event to race');
	},
	// get full current game state from the server (normally only when we first connect)
	stateFromServer: function(gameState) {
	    console.log('received state from server');
	    this.get('history').setObjects([]);
	    this.set('started', gameState.started);
	    this.set('finished', gameState.finished);
	    var players = gameState.players.map(function(item){
	        return App.Player.create({
	            id: item.id,
	            index: item.index,
	            name: item.name,
	            token: item.token,
	            position: item.position,
	            ready: item.ready
	        });
	    });
	    this.get('players').setObjects(players);
	},
	// user has entered their name - tell server (we should get back a 'weHaveJoined' call)
	createPlayerName: function(playerName) {
        this.socket.emit('playerJoin', playerName);
	},
	// acknowledgement from server about who we are - player creation of viewing player
	weHaveJoined: function(playerInfo) {
	    // create the player
	    var player = this.playerJoined(playerInfo);
	    // note that it is us
	    this.set('viewingPlayer', player);
	},
	// a player has joined - create that player
	playerJoined: function(playerInfo) {
	    var player = App.Player.create({
	        id: playerInfo.id,
	        index: playerInfo.index,
	        name: playerInfo.name,
	        token: playerInfo.token,
	        position: playerInfo.position,
	        ready: playerInfo.ready
        });
	    
	    this.get('players').pushObject(player);
	    return player;
	},
	// tell server we are ready to race
	clickReady: function() {
	    console.log('clickReady');
	    this.socket.emit('playerReady', this.get('viewingPlayer').get('id'));
	},
	// server tells us that a player is ready to race (this includes us - acknowledgement of our 'playerReady' msg)
	serverReady: function(playerId) {
	    //console.log('serverReady: ' + playerId);
	    this.findPlayer(playerId).set('ready', true);
	},
	beginRace: function(startingPlayerId) {
	    var player = this.findPlayer(startingPlayerId);
	    //console.log('begin race! - starting with player ' + player.get('name'));
	    this.set('whoseTurn', player);
        App.myIndexController.transitionToRoute('race');
	},
	roll: function() {
	    this.socket.emit('roll', this.get('viewingPlayer').get('id'));
	},
	didTurn: function(turnData) {
	    // record the move
	    var player = this.findPlayer(turnData.player);
	    player.set('position', turnData.position);
	    var nextPlayer = this.findPlayer(turnData.whoseTurn);
	    //console.log('player ' + player.get('name') + ' moved to ' + turnData.position);
	    //console.log('it is now ' + nextPlayer.get('name') + "'s turn");
	    // change whose turn it is
	    this.set('whoseTurn', nextPlayer);
	},
	eventFromServer: function(event) {
        var player = this.findPlayer(event.playerId);
        //console.log(event.type + ' for ' + player.get('name'));
        if (event.type == 'movedTo') {
            player.set('position', event.value);
        }
        else if (event.type == 'turn') {
            this.set('whoseTurn', player);
        }
        event.playerName = player.get('name');
        var history = this.get('history');
        history.pushObject(event);
        
	},
	myTurn: function() {
	    return this.get('viewingPlayer') == this.get('whoseTurn');
	}.property('viewingPlayer', 'whoseTurn'),
	findPlayer: function(id) {
	    return this.get('players').findProperty('id', id) || null;
	},
	randomPlayer: function() {
	    var ps = this.get('players');
	    var rIndex = Math.floor(Math.random()*ps.length);
	    return ps[rIndex];
	}
});

App.BuildRace = function()
{
    var players = [];
    var history = [];
    /*
    $.each(App.PlayerData, function(ix, pdata){
        var player = App.Player.create(pdata);
        players.push(player);
        history.push({type: 'join', playerId: player.get('id'), playerName: player.get('name')});
    });
    */
    var race = App.Race.create({players: players, history: history, name: 'Race53'});
    /*
    var betty = race.findPlayer(3);
    race.set('viewingPlayer', betty);
    */
    
    return race;
};


// server events are json objects containing:
// type (one of 'join', 'leave', 'turn', 'movedTo', 'win')
// player id
// value (for movedTo)

// for test beginning, we'll assume the players have joined, nobody is leaving and nobody wins
// we'll just randomly generate "turn" and "movedTo" events
function randomEvent(race)
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
    var player = race.randomPlayer();
    
    return {type: type, playerId: player.get('id'), value: value};
}

function runEventStream(race)
{
    var count = 0;
    var inv = 0;
    inv = window.setInterval(function() {
        var event = randomEvent(race);
        race.eventFromServer(event);
        
        if (++count >= 30) {
            window.clearInterval(inv);
        }
    }, 1500);
}

