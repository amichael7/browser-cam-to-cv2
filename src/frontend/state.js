'use strict';

const events = require('events'),
	emitter = new events.EventEmitter();

module.exports = {
	portMap: {},
	onchange: function(callback) {
		// on change, trigger callback with id as a parameter
		emitter.on('change', callback);
	},
	set: function(id, port) {
		this.portMap[id] = port;
		emitter.emit('change', id);
	},
	get: function(id) {
		return this.portMap[id];
	},
};