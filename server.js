'use strict';

/*
 * Program: server.js
 * Author: Alex Michael
 *
 * Description: creates (1) a node server which receives a video
 *              stream and forwards to Python backend, (2) a
 *              ZeroMQ signalling server to communicate with
 *              Python backend, and (3) a web socket server to
 *              receive video from the browser client.
 */



const httpsServer = require('./src/frontend/https.server');
const zmqServer = require('./src/frontend/zmq.server')
const log = require('./src/frontend/log');
const wsServer = require('./src/frontend/ws.server');
const config = require('./src/frontend/config');


/**
 * Bind ZeroMQ signalling interface to specified port
 */
const zmq = zmqServer.start(config.signallingPort);

/**
 * Start HTTPS server on the port specified
 */
const server = httpsServer.start(config.host, config.serverPort);


/**
 * Configure and start websocket server
 */
const wss = wsServer.create(server, zmq);


