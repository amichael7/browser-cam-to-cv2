'use strict';

/****************************************************************************
* Utility functions
****************************************************************************/
class util {
	static getBaseAddress(){
		var address = location.href;
		address = address.split('://')[1];
		return address.split('/')[0];
	}

	static getConnectionType() {
		var connectionProtocol = location.href.split('://')[0];
		if(connectionProtocol == 'https') return 'secure';
	}

	static handleErr(err) {
		const msg = 'getUserMedia() error: ' + err.name;
		console.error(err);
		alert(msg);
	}
}
