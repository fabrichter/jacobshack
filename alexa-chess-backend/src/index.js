'use strict';
var AWS = require('aws-sdk');
AWS.config.region = 'eu-west-1'
var Alexa = require('alexa-sdk');
var Chess = require('chess.js').Chess;
var http = require('http');
var querystring = require('querystring');

var APP_ID = "amzn1.ask.skill.b01cfd4b-d5c6-4eb8-a3dc-c3b0e6d982c7";
var SKILL_NAME = 'Space Facts';

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.appId = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};
function natoAlphabet(s) {
	return s
		.replace('alfa', 'a')
		.replace('alpha', 'a')
		.replace('bravo', 'b')
		.replace('charlie', 'c')
		.replace('charly', 'c')
		.replace('delta', 'd')
		.replace('echo', 'e')
		.replace('epsilon', 'e')
		.replace('foxtrot', 'f')
		.replace('golf', 'g')
		.replace('hotel', 'h');
}

function createBoard(id, cb) {
	console.log('starting post ' + id);
	http.request({hostname: "node-express-env.yppentce29.eu-west-1.elasticbeanstalk.com", port: 80, path: "/game/" + id, method: 'POST'}, (res) => {
		console.log('post handler');
		cb();
	}).end();
}

function broadcastBoard(board, id, cb) {
	var data = querystring.escape(board);
	console.log("put path: " + "/game/" + id + '/' + data);
	http.request({hostname: "node-express-env.yppentce29.eu-west-1.elasticbeanstalk.com", port: 80, path: "/game/" + id + '/' + data, method: 'PUT'}, (res) => {
		console.log('put handler');
		cb();
	}).end();
}
function deleteBoard(id, cb) {
	console.log('delete ' + id);
	http.request({hostname: "node-express-env.yppentce29.eu-west-1.elasticbeanstalk.com", port: 80, path: "/game/" + id, method: 'DELETE'}, (res) => {
		console.log('delete handler');
		cb();
	}).end();
}

var handlers = {
    'NewSession': function () {
        this.emit('NewGame');
    },
    'NewGameIntent': function () {
        this.emit('NewGame');
    },
	'NewGame': function() {
		this.emit(':ask', 'Before playing, please tell me your names.', 'What are your names?');
	},
	'NameIntent': function() {
		// this.emit(':tell', 'wow such debugging');
		var name = this.event.request.intent.slots.Name;
		if (!name || !name.value) {
			this.emit(':ask', 'Can you tell me your name?', 'Please tell me your name.');
		} else {
			if (this.attributes.firstName) {
				this.attributes.secondName  = name.value;
				var turn = 'It is ' + this.attributes.firstName + '\'s turn. Make your move.';
				this.attributes.turn = 0;
				this.attributes.id = 'jacobsHack';//Math.random().toString(36).substr(2, 5);
				var board = new Chess().fen();
				this.attributes.board = board;
				var idString = "<say-as interpret-as=\"spell-out\">" + this.attributes.id + '</say-as>';
				createBoard(this.attributes.id, () => {
					broadcastBoard(board, this.attributes.id, () => {
						let link = 'You can watch the game at domain?' + idString + ' .';
						this.emit(':askWithCard', 'Now you can start to play. ' + link + turn, turn, 'Watch the game in your browser.', 'It\'s at domain?' + this.attributes.id);

					});
				});
			} else {
				this.attributes.firstName = name.value;
				this.emit(':ask', 'Thank you. What\'s the name of the second player?',  'What\'s the name of the second player?');
			}
		}
	},
	'TurnIntent': function() {
		var slots = this.event.request.intent.slots;
		var from = slots.From;
		var to = slots.To;
		if (!from || !from.value || !to || !to.value) {
			this.emit(':ask', 'Please choose your move, e.g. <say-as interpret-as="spell-out">a1</say-as> to <say-as interpret-as="spell-out">b3</say-as>', 'Your move?');
		} else {
			var fromCode = from.value.replace(' ', '');
			fromCode = natoAlphabet(fromCode);
			var toCode = to.value.replace(' ', '');
			toCode = natoAlphabet(toCode);
			var board = new Chess();
			board.load(this.attributes.board);
			var move = board.move({from: fromCode, to: toCode });
			if (move) {
				this.attributes.board = board.fen();
				broadcastBoard(this.attributes.board, this.attributes.id, () => {
					this.attributes.turn = (this.attributes.turn == 0 ? 1 : 0);
					var name = "";
					if (this.attributes.turn == 0) {
						name = this.attributes.firstName;
					} else {
						name = this.attributes.secondName;
					}

					if (board.game_over()) {
						if (board.in_checkmate()) {
							this.attributes.turn = (this.attributes.turn == 0 ? 1 : 0);
							this.emit(':tell', 'Checkmate for ' + name);
						} else if (board.in_draw()) {
							this.emit(':tell', 'It\'s a draw');
						} else if (board.in_stalemate()) {
							this.emit(':tell', 'It\'s a stalemate');
						} else if (board.in_threefold_repetition()) {
							this.emit(':tell', 'Threefold repetition');
						}
							
					} else {
						var turn = 'Now it\'s ' + name + '\'s turn. What\'s your move?';
						if (board.in_check()) {
							turn += 'By the way, you are in check.';
						}
						this.emit(':ask', turn, turn);
					}
				});
			} else {
				this.emit(':ask', 'That\'s not a valid move. Please try again.', 'Your move?');
			}
		}
	},
	'WatchIntent': function () {
		if (this.attributes.id) {
			var idString = "<say-as interpret-as=\"spell-out\">" + this.attributes.id + '</say-as>';
			let link = 'You can watch the game at domain?' + idString + ' .';
			this.emit(':askWithCard', link, link, 'Watch the game in your browser.', 'It\'s at domain?' + this.attributes.id);
		}
	},
    'AMAZON.HelpIntent': function () {
        var speechOutput = "Here, You can play chess with two players. What can I help you with?";
        var reprompt = "What can I help you with?";
        this.emit(':ask', speechOutput, reprompt);
    },
    'AMAZON.CancelIntent': function () {
		if (this.attributes.id)
			deleteBoard(this.attributes.id, () => {
				this.emit(':tell', 'Goodbye!');
			});
		else {
			this.emit(':tell', 'Goodbye!');
		}
    },
    'AMAZON.StopIntent': function () {
		if (this.attributes.id)
			deleteBoard(this.attributes.id, () => {
				this.emit(':tell', 'Goodbye!');
			});
		else {
			this.emit(':tell', 'Goodbye!');
		}
    }
};
