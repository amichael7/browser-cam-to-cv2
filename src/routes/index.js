/*
 * Program index.js
 * Author: Alex Michael
 *
 * Description: returns the WebRTC site on an inbound
 *		connection.
 */

'use strict';

var express = require('express');
var router = express.Router();
var path = require('path')

/* GET home page. */
router.get('/', function(req, res) {
	res.sendFile(path.join(__dirname, '../views/index.html'));
});

module.exports = router;