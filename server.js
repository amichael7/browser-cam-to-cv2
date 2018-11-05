/*
 * Program: server.js
 * Author: Alex Michael
 *
 * Description: creates a node server which can receive an image
 *		stream from clients.  The image stream is not processed
 *		at all and is instead sent to Python using ZeroMQ.
 */

'use strict';

var debug = require('debug')('webrtc-python-example:server');
var createError = require('http-errors');
var fs = require('fs')
var express = require('express');
const WebSocket = require('ws');
var zerorpc = require('zerorpc');

var https = require('https');
var http = require('http');


const app = express()
const port = normalizePort(process.env.PORT || '3000')
app.set('port', port)

var config = JSON.parse(fs.readFileSync('_config.json', 'utf8'));
var wss;
var SECURE;
var address;

if(config.address && config.address != ""){
	SECURE = true;
	address = config.address;
} else {
	SECURE = false;
}

if (SECURE) {
	try {
		var privateKey  = fs.readFileSync('sslcert/private.pem', 'utf8');
		var certificate = fs.readFileSync('sslcert/public.pem', 'utf8');
	} catch(e) {
		throw {error:'there was a problem with the SSL certificate, see README on creating a certificate'}
	}
	var credentials = {key: privateKey, cert: certificate};
	var server = https.createServer(credentials, app);

	wss = new WebSocket.Server({server: server /*, path: "/hereIsWS"*/});
} else {
	var server = http.createServer(app)
	wss = new WebSocket.Server({server: server});
}

/*
 * Connect to python img.py process
 * being hosted on the port specified
 */
var client = new zerorpc.Client();
client.connect("tcp://127.0.0.1:4242");


// Index route handler
var index = require('./src/routes/index')
app.use('/', index);

// host the contents of the views folder
app.use(express.static('./src/views'));

// error handler
var err = require('./src/routes/err');
app.use(err.handle);


app.use("/config.json", express.static(__dirname + '_config.json'));


wss.on('connection', function connection(ws) {
	ws.send('connected');

	ws.on('message', function incoming(message) {
		var data = decodeImg(message);
		if(data) {
			var ui32 = new Uint32Array(data.buffer, data.byteOffset, data.byteLength / Uint32Array.BYTES_PER_ELEMENT);

			client.invoke("process_img", data, function(error, res, more) {
				console.log(res);
			});
		}
	});
});


/*
 * Start the server on the port specified
 */
if(SECURE) server.listen(port, address);
else server.listen(port)

server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
	var port = parseInt(val, 10);

	if (isNaN(port)) {
		// named pipe
		return val;
	}

	if (port >= 0) {
		// port number
		return port;
	}

	return false;
}

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
	if (error.syscall !== 'listen') {
		throw error;
	}

	var bind = typeof port === 'string'
		? 'Pipe ' + port
		: 'Port ' + port;

	// handle specific listen errors with friendly messages
	switch (error.code) {
		case 'EACCES':
			console.error(bind + ' requires elevated privileges');
			process.exit(1);
			break;
		case 'EADDRINUSE':
			console.error(bind + ' is already in use');
			process.exit(1);
			break;
		default:
			throw error;
		}
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
	var addr = server.address();
	var bind = typeof addr === 'string'
		? 'pipe ' + addr
		: 'port ' + addr.port;
	debug('Listening on ' + bind);
}


function decodeImg(imgStr) {
	if (!/data:image\//.test(imgStr)) {
		console.log('ImageDataURI :: Error :: It seems that it is not an Image Data URI. Couldn\'t match "data:image\/"');
		return null;
	}

	let regExMatches = imgStr.match('data:(image/.*);base64,(.*)');
	return new Buffer(regExMatches[2], 'base64');
}