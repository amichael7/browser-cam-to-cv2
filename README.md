# browsercv

## What is this?

Use any device with a webcamera, a modern browser and an internet connection to send a live video feed to Python's OpenCV2 library via an independent Node.js signaling server.


## Why use `browsercv`?

This project is intended to to be forkable for use in computer vision projects. Use `browsercv` if you want to be able to quickly stream live video to OpenCV for testing real-time computer vision algorithms (such as object detection, SLAM, augmented reality, face detection/recognition, etc...).  In development, `browsercv` has emphasized speed, the project is architected to be as fast as reasonably possible for a simple project like this (with the caveat that the project uses network connections as IPC and two interpreted languages).  Latency is critical in making real-time computer vision applications interactive enough to be useful which `browsercv` takes into account.  `browsercv` consists of a Node.js server which routes video data from web browser clients to a Python OpenCV backend where it can be processed.  The Python backend is meant to be easily decoupled from the server interface and can be placed across a (reliable) network connection (receiving video over UDP and speaking TCP via ZeroMQ to the web server for signaling). `browsercv` is meant to be flexible and quick to set up so you can open the codebase and start hacking right away.  However, this project is still just a simple development server and therefore is not production ready.


## How to use the project

1. Install all the dependencies
	* Node.js (Recommend using [fnm](https://github.com/Schniz/fnm))
	* Python 3.6+
	* FFMpeg
	* OpenSSL
	* Linux (*recommended*)

1. Install packages ang generate SSL certificates (`npm install`) <sup>[1]</sup>

1. Start the node server (`npm start`)

1. Navigate to the server address in your web browser (default `https://localhost:3000`)

```bash
git clone git@github.com:amichael7/browsercv		# get the code
cd browsercv

sudo apt-get update									# Install OS-level dependencies
sudo apt-get install -y ffmpeg python3 openssl

curl -fsSL https://fnm.vercel.app/install | bash	# Install Node.js
fnm install

npm install		# Install packages

npm start		# Concurrently start Node server and OpenCV backend
````

[1] HTML5's getUserMedia() function requires a either a secure connection (over HTTPS) or a connection over localhost.


## How does it work?


This project uses Node.js to serve the page and the Node.js websockets module [`ws`](https://www.npmjs.com/package/ws) to stream video chunks captured by a MediaRecorder object from the client to the server.  On the backend the project uses ZeroMQ to signal between the two servers and re-broadcasts the video data directly over UDP.

The program uses collects a media stream using HTML5.  The video stream is then drawn onto an invisible Canvas element at a specified framerate.  The canvas is then resized and drawn onto a visible canvas.  As a separate step, the projected image is sent as a base-64-encoded, compressed JPEG to the server over a WebSocket connection.


<!-- <img src="https://github.com/amichael7/browsercv/raw/master/assets/screencap.gif" alt="Screenshot" width="500"/> -->


## Configuration

The configuration is set through the following environment variables.  Configuration is parsed in `src/backend/config.py` and `src/frontend/config.js`

| Variable | Description |
|----------|-------------|
| `SIGNALLING_PORT` | Sets the port that the web server can subscribe to for details on the streams, including bounding boxes for example (default: 3002) |
| `PUBSUB_PORT` | Sets the port that the web server can subscribe to for details on the streams, including bounding boxes for example (default: 3002) |
| `N_WORKERS` | Sets the number of backend OpenCV workers (default: number of CPUs * 2 - 1 since each process doesn't saturate the CPU it's running on) |



-----

## TODO:

- [ ] Add gifs to README
- [X] Migrate from sending frames to streaming video

__server__
- [X] Implement two way JSON communication over the WebSocket
- [X] Enable multiple UDP connections
- [X] Fix empty frame error
- [ ] Un-jank the Node signalling router (add proper open & close routing)
- [ ] Implement PubSub server to transmit data async to server
	- i.e. bounding boxes, worker shutdowns etc...
- [ ] Implement basic face-detection
- [ ] Add camera switching capability (use a new websocket)

__bugs__
- [ ] stream sometimes cuts out after a few minutes (unsure why)

__future__
- [ ] Latency measurements (idea: 'barcode' on the bottom right?)
- [ ] Support variable bitrate encoding (dependent on some sort of latency measurement)
	- Use multiple MediaRecorders and just switch handler dynamically