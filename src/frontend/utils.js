/*
 * Program: utils.js
 * Author: Alex Michael
 *
 * Description: Common utils for the frontend.
 *
 */

var fs = require('fs');


function normalizePort(val) {
    // Normalize a port into a number, string, or false.
    var port = parseInt(val, 10);

    if (isNaN(port))    // named pipe
        return val;

    if (port >= 0)  // port number
        return port;

    return false;
}


function sizeOf( object ) {
    // approximate the size in bytes of an object
    // https://stackoverflow.com/q/1248302
    var objectList = [];
    var stack = [ object ];
    var bytes = 0;

    while ( stack.length ) {
        var value = stack.pop();
        if ( typeof value === 'boolean' ) {
            bytes += 4;
        } else if ( typeof value === 'string' ) {
            bytes += value.length * 2;
        } else if ( typeof value === 'number' ) {
            bytes += 8;
        } else if (
            typeof value === 'object'
            && objectList.indexOf( value ) === -1
        ) {
            objectList.push( value );

            for( var i in value ) {
                stack.push( value[ i ] );
            }
        }
    }
    return bytes;
}

function getSecureOpts() {
    return {
        key: fs.readFileSync('./ssl/key.pem'),
        cert: fs.readFileSync('./ssl/cert.pem'),
    };
}


exports.normalizePort = normalizePort;
exports.getSecureOpts = getSecureOpts;
exports.sizeOf = sizeOf;
