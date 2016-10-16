var express = require('express');
var querystring = require('querystring');
var app = express();

var games = {};

app.get('/game/:id', function (req, res) {
	var id = req.params.id;
	if (games[id] != null) {
		var data = games[id];
		res.writeHead(200, {'Content-Type': 'text/plain'});
		res.write(data);
		res.end();
	} else {
		res.writeHead(404);
		res.end();
	}
	console.log('get; now: ' + JSON.stringify(games));
});
app.post('/game/:id', function(req, res) {
	var id = req.params.id;
	if (games[id] != null) {
		res.writeHead(403);
		res.end();
	} else {
		games[id] = "";
		res.writeHead(200);
		res.end();
	}
	console.log('post; now: ' + JSON.stringify(games));
});
app.put('/game/:id/:state', function(req, res) {
	var id = req.params.id;
	if (games[id] != null) {
		games[id] = querystring.unescape(req.params.state);
		res.writeHead(200);
		res.end();
	} else {
		res.writeHead(404);
		res.end();
	}
	console.log('put; now: ' + JSON.stringify(games));
});
app.delete('/game/:id', function(req, res) {
	var id = req.params.id;
	if (games[id] != null) {
		delete games[id];
		res.writeHead(200);
		res.end();
	} else {
		res.writeHead(404);
		res.end();
	}
	console.log('delete; now: ' + JSON.stringify(games));
});

app.use(express.static('static'));
var port = process.env.PORT || 3000;
app.listen(port, function () {
	console.log('listening at port ' + port);
});
