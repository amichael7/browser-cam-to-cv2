/*
 * Program: http.server.js
 * Author: Alex Michael
 *
 * Description: HTTP server routing and control.
 *
 */


var fs = require('fs');
var https = require('https');
var path = require('path');
var { networkInterfaces } = require('os')

const qrcode = require('qrcode');

var log = require('./log');
var utils = require('./utils');

var server;

const tag = 'https.server'

function getMimeType(filePath) {
    // return the MIME type for a file
    var extName = String(path.extname(filePath)).toLowerCase();
    return {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.mp4': 'video/mp4',
        '.webm': 'video/webm',
        '.wasm': 'application/wasm',
    }[extName] || 'application/octet-stream';
}


function serveStatic(res, route) {
    // Streaming static file server
    const filePath = `./src/${route}`
    fs.stat(filePath,  (err, stats) => {
        if (stats) {
            fs.createReadStream(filePath).pipe(res);
        } else {
            err(res)
        }
    });
}

function err(res) {
    // Basic 404 response
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain');
    res.end('404 - Not Found');
}


function parseUrl(url) {
    // URL parser
    const route = url.split('/').filter(String);
    var lastEntry, query;
    if (route.length > 0) {
        [lastEntry, query] = route.pop().split('?', 1);
        route.push(lastEntry);
    }
    return { route, query };
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


function getIP() {
    ifaces = networkInterfaces()
    return ifaces[Object.keys(ifaces).filter((k) => k !== 'lo')[0]].filter((d) => d['family'] === 'IPv4')[0]['address']
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
    var addr = server.address();
    var bind, hostname;
    if (typeof addr !== 'string') {
        bind = addr.address === 'localhost' ? `http://localhost` : `https://${getIP()}`;
        bind += `:${addr.port}`
    } else {
        bind = 'pipe ' + addr
    }
    log.info('Frontend server listening on ' + bind, tag);

    qrcode.toString(bind, function(err, string) {
        if (err) throw err
        console.log(string)
    })
}


function httpsServer(req, res) {
    if (req.method == 'GET') {  // Request router
        const {route, query} = parseUrl(req.url);
        if (route.length == 0) {
            serveStatic(res, 'views/index.html');
        } else if (route[0] == 'static') {
            serveStatic(res, route.join('/'));
        } else {
            err(res);
        }
    }
    log.info(log.serverLog(res), tag);
}



function start(hostname, port) {
    const options = utils.getSecureOpts();

    server = https.createServer(options, httpsServer);
    server.listen({
        host: hostname,
        port: port,
    })
    server.on('error', onError);
    server.on('listening', onListening);
    return server;
}



exports.start = start;