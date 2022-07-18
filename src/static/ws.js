'use strict';



var ws = function() {
	var socket;

	const state = {
		CONNECTING: 0,  // socket has been created, connection not yet open.
		OPEN: 		1,  // connection is open and ready to communicate.
		CLOSING: 	2,  // connection is in the process of closing.
		CLOSED: 	3,	// connection is closed or couldn't be opened.
	};

	const types = {
		VIDEO: 		0,	// code for video data chunks
		JSON: 		1,	// code for JSON data
	};

	function create() {
		if (util.getConnectionType() == 'secure')
			socket = new WebSocket(`wss://${util.getBaseAddress()}`);
		else
			socket = new WebSocket(`ws://${util.getBaseAddress()}`);

		socket.onmessage = onmessage;
		socket.onclose = onclose;
		socket.onopen = onopen;
	}

	function send(message, code) {
		if (typeof code === 'undefined') {
			console.warn('Message type not specified')
			return 1
		}
		if (code != types.VIDEO && code != types.JSON) {
			console.warn('Unsupported message type')
			return 1
		}

		code = String.fromCharCode(code)
		if (socket.readyState == state.OPEN) {
			socket.send(new Blob(['!', code, message]));
		} else {
			console.warn('Socket state not \'OPEN\'')
		}
	}

	function onmessage(event) {
		console.log(event.data)
	}

	function onclose(event) {
		console.log('Socket was closed')
	}

	function onopen(event) {
		send(JSON.stringify({  // acknowledge socket creation
	        data: {
	            message: 'connection opened',
	        }
	    }), types.JSON);
	}

	return {
		create: create,
		send: send,
		messageTypes: types,
	}
}();

ws.create();


