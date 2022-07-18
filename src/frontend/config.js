'use strict';

const utils = require('./utils');


module.exports = {
    host: process.env.HOST || '0.0.0.0',
    serverPort: utils.normalizePort(process.env.PORT || '3000'),
    signallingPort: utils.normalizePort(process.env.SIGNALLING_PORT || '3001'),
    pubSubPort: utils.normalizePort(process.env.PUBSUB_PORT || '3002'),
}