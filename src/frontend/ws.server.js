/*
 * Program: ws.server.js
 * Author: Alex Michael
 *
 * Description: WebSocket server routing and control.
 *
 *      Based on: https://github.com/MuxLabs/wocket
 */


var log = require('./log');
var state = require('./state');
var utils = require('./utils');

var crypto = require('crypto');
var dgram = require('node:dgram');
var websocket = require('ws');


const tag = 'ws.server'

const types = {
    VIDEO:      0,  // code for video data chunks
    JSON:       1,  // code for JSON data
};


function createServer(server, zmq) {
    // create and configure the websocket server
    const wss = new websocket.WebSocketServer({server});

    wss.zmq = zmq;
    wss.on('connection', onconnected);

}

function onconnected(ws) {    
    // set context for ws event methods
    const hash = crypto.createHash('md5')
                    .update(Date.now().toString())
                    .digest('hex')
                    .substring(0, 8);
    
    log.info(`Connection opened [id: ${hash}]`, tag);

    // acknowledge socket creation and send connection event to backend
    const notifyConnection = JSON.stringify({
        data: {
            event: 'open',
            id: hash,
        }
    })
    reply = this.zmq.send(notifyConnection);

    // set variables and listeners on ws
    ws.id = hash;
    ws.zmq = this.zmq;
    ws.udp = dgram.createSocket('udp4');

    // set a listener for port changes
    ws.port = null;
    state.onchange(function(id) {
        if (id == hash) {
            const port = state.get(id);
            log.info(`Port assigned: ${port} [id: ${id}]`, tag)
            ws.port = port;
        }
    })

    ws.on('message', onmessage);
    ws.on('close', onclose);
}


function onmessage(msg) {
    // Messages should start with '!' (code 33) and then their message code
    // see types definition (currently JSON (1) or VIDEO (0))
    if (msg[0] != 33) {
        log.debug(`Invalid data received, message start code: ${code} != 33`, tag);
        return 1;
    }
    const code = msg[1];
    if (code == types.VIDEO) {
        if (this.port != null) {
            this.udp.send(msg.subarray(2), this.port, 'localhost', onErrUDP);    
        }
    } else if (code == types.JSON) {
        log.info(msg.subarray(2), tag)
    } else {
        log.debug(`Message ignored, invalid message type: ${code}`, tag)
    }   
}


function onclose(event) {
    log.info(`Connection closed [id: ${this.id}]`, tag);
    this.udp.close()
}

function onErrUDP(err) {
    if (err) {
        log.err(err, tag)
        udp.close();
    }
}

exports.create = createServer;
