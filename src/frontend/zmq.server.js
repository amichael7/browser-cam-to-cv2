'use strict';

var log = require('./log');
const state = require('./state');
const libzmq = require('zeromq'),
      zmq = libzmq.socket('req');


const tag = 'zmq.server'

// signalling router
function onmessage(msg) {
	log.info(msg.toString(), tag);
	msg = JSON.parse(msg);
	const port = msg['data']['port'],
		id = msg['data']['id'];
	state.set(id, port);
}

function start(port) {
	zmq.connect(`tcp://127.0.0.1:${port}`);
	log.info(`ZeroMQ client connected to to local port: ${port}`, tag);

	zmq.on('message', onmessage);

	return zmq;
}

exports.start = start;
