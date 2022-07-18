/*
 * Program: log.js
 * Author: Alex Michael
 *
 * Description: Logging utility for the frontend.
 *
 */


function serverLog(res) {
    const ts = new Date().toISOString();
    return [  // CLF log utility 
        res.req.connection.remoteAddress,
        '-',
        '-', 
        `[${ts}]`,
        res.req.method,
        res.req.url,
        'HTTP/' + res.req.httpVersion,
        res.statusCode,
        !res._contentLength ? '-' : res._contentLength,
    ].join(' ');
}

function info(msg, tag) {
    console.info(`${tag}: ${msg}`)
}

function err(msg, tag) {
    console.error(`${tag}: ${msg}`)
}

function debug(msg, tag) {
    console.debug(`${tag}: ${msg}`)   
}

exports.serverLog = serverLog;
exports.info = info;
exports.err = err;