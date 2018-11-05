'use strict';

// Local stream that will be reproduced on the video.
var videoSelect = document.querySelector('select#videoSource');
var video = document.querySelector('video');
var photo = document.getElementById('photo');
var photoContext = photo.getContext('2d');


var websocket;

if(getConnectionType() == 'secure')
	websocket = new WebSocket(`wss://${getBaseAddress()}`);
else
	websocket = new WebSocket(`ws://${getBaseAddress()}`);

var photoContextW;
var photoContextH;
var frameRate;


(function main(){
	navigator.mediaDevices.enumerateDevices()
	.then(getDevices).then(getStream).catch(handleErr);

	videoSelect.onchange = getStream;

	var timer = setInterval(function () {
		sendPhoto();
	}, 100 /* Math.floor(1000/frameRate) */);
}());


/****************************************************************************
* User media (webcam)
****************************************************************************/
function getDevices(deviceInfos) {
	for (var i = 0; i !== deviceInfos.length; ++i) {
		var deviceInfo = deviceInfos[i];
		var option = document.createElement('option');
		option.value = deviceInfo.deviceId;
		if (deviceInfo.kind === 'videoinput') {
			option.text = deviceInfo.label || 'camera ' +
			(videoSelect.length + 1);
			videoSelect.appendChild(option);
		} else {
			console.log('Found one other kind of source/device: ', deviceInfo);
		}
	}
}


function getStream() {
	console.log('Getting user media (video) ...');
	navigator.mediaDevices.getUserMedia({
		audio: false,
		video: { 
			deviceId: {exact: videoSelect.value}
		}
		//video: { facingMode: { exact: "user" } }
	})
	.then(function(stream) {
		// console.log('getUserMedia video stream URL:', stream);
		var videoTracks = stream.getVideoTracks()
		var videoSettings = videoTracks[videoTracks.length -1].getSettings()
		var height = videoSettings.height;
		var width = videoSettings.width;
		frameRate = videoSettings.frameRate;

		window.stream = stream; // stream available to console
		
		video.srcObject = stream;
		photo.height = photoContextH = height;
		photo.width = photoContextW = width;

		console.log('gotStream with width and height:', photoContextW, photoContextH);
	})
	.catch(function(e) {
		handleErr(e);
	});
};


function sendPhoto() {
	var canvas = document.createElement('canvas');
	var ctx  = canvas.getContext('2d');
	
	var compression = 0.8
	var width = Math.round(photoContextW * compression);
	var height = Math.round(photoContextH * compression);
	canvas.width = width;
	canvas.height = height;
	ctx.drawImage(video, 0, 0, width, height);
	photoContext.drawImage(canvas,0,0, photoContextW, photoContextH);

	var image = canvas.toDataURL('image/jpeg',compression);
	//image.replace(/^data:image\/(png|jpg);base64,/, "");
	websocket.send(image);
}

/*
websocket.onmessage = function(str) {
	// should be a base 64 image.
	console.log("Someone sent: ", str);
};
*/


function getBaseAddress(){
	var address = location.href;
	address = address.split('://')[1];
	return address.split('/')[0];
}

function getConnectionType() {
	var connectionProtocol = location.href.split('://')[0];
	if(connectionProtocol == 'https') return 'secure'
}

function handleErr(err) {
	alert('getUserMedia() error: ' + err.name);
}