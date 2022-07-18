

// Local stream that will be reproduced on the video.
var videoSelector = document.querySelector('select#videoSource');
var video = document.querySelector('video');


/****************************************************************************
* User media (webcam)
****************************************************************************/
function getDevices(devices) {
	for (var i = 0; i !== devices.length; ++i) {
		var deviceInfo = devices[i];
		var option = document.createElement('option');
		console.debug('getDevices(): Found device: ', deviceInfo);
		if (deviceInfo.kind === 'videoinput') {
			option.text = deviceInfo.label || 'camera ' + (videoSelector.length + 1);
			option.value = deviceInfo.deviceId;
			videoSelector.appendChild(option);
		}
	}
}


function getStream() {
	console.info('Getting user media (video) ...');
	return navigator.mediaDevices.getUserMedia({
		audio: false,
		video: { 
			deviceId: {exact: videoSelector.value}
		}
	})
}



/****************************************************************************
* Transmit video chunks over WebSocket connection
****************************************************************************/
function record(stream) {
	var settings = stream.getVideoTracks().slice(-1)[0].getSettings()
	const 	height = settings.height, 
			width = settings.width,
			frameRate = settings.frameRate;
	
	video.srcObject = stream;

	console.log(`Got video stream (${width} x ${height}; ${frameRate} fps)`);

	var options = {mimeType: 'video/webm;codecs=vp9'}; 	// Do not change MIME type
	var mediaRecorder = new MediaRecorder(stream, options);
	mediaRecorder.ondataavailable = handleDataAvailable;
	mediaRecorder.start(25);

	function handleDataAvailable(event) {
		if (event.data.size > 0) ws.send(event.data, ws.messageTypes.VIDEO);
	}
}


/****************************************************************************
* Main function
****************************************************************************/
(function main() {
	// Set up user media
	var devices = navigator.mediaDevices;
	if (devices) {
		devices.getUserMedia({ video: true }).then(() => {
			devices.enumerateDevices()
					.then(getDevices)
					.then(getStream)
					.then(record)
					.catch(util.handleErr);
		}).catch(util.handleErr);
	} else {
		console.error('Accessing mediaDevices disabled outside secure context');
	}
	videoSelector.onchange = () => {
		getStream().then(record);
	};
}());
