#browser-cam-to-cv2

##What is this?
-----

This project allows you to use any device with a webcamera, a modern browser, and an internet connection to send a live video feed to Python's OpenCV2 library via an independent Node.JS server.


##Why use this project?
-----

This project is intended to be used in or adapted for computer vision projects.  If you are looking for a realistic data stream to test your computer vision algorithm, this project can deliver a stream.  This project consists of a light webapp hosted over a Node.JS server which allows for a large number of connections.

The server then sends the data it's gathering over to an instance of Python where it can be processed using Python's powerful suite computer vision tools.  The distributed nature of this project means that the server is lightweight and you can run your Python-based computer vision tools on a seperate device from the server.


##How to use the project
-----
1. Install all the dependencies
	* Install the Node.JS v8.12+
		* `npm install`
	* Install Python 3.7+
		* `pip3 install --upgrade sdl2 cv2 zerorpc numpy Pillow`

1. Add a __config.json__ file.
	* The file should contain the address and the file should take the format:
	```
	[
		{"address":"XXX.XXX.XX.XXX"}
	]
	```

1. Start the python instance
	* `python img.py`

1. Start the node server
	* `npm start`

1. Navigate to:
	* localhost:3000 if you are hosting locally
	* https://[ip address]:3000 if you are hosting over LAN
	* https://your-domain.example.com if you are hosting publically.

__Note 1:__ HTML5's getUserMedia() function requires a either a secure connection (over HTTPS) or a connection over localhost.

__Note 2:__ If you are installing SDL2 on a Windows machine, you may have to manually download the `SDL2.dll` file and place it in the Python package's directory.


##What is this project's stack?
-----

This project uses Node.JS and express to serve the page and the Node.JS websockets module "ws" to stream photos from the client to the server.  On the backend the project uses the Node module "zerorpc" and the python package "zerorpc" to broker a connection between the Node server and the separate Python process using ZeroMQ.

On the python side, the images are converted to a numpy array.  The Python process uses:

* SDL2 to display the datastream
* OpenCV to parse the datastream for the SDL2 display
* zerorpc to receive messages from the Node server


####Isn't WebSockets too slow to send a video stream?

What we're sending isn't really a video stream because of the way it is generated in the app.  What we are sending is a stream of compressed images.  Conceptually, TCP isn't such a slow platform that it is untennable for streaming images (see [StackOverflow](https://stackoverflow.com/questions/4241992/video-streaming-over-websockets-using-javascript#4263239)).  That said, if you have a suggestion for a faster streaming method, I would love to hear it.


##How does this program work?
-----

The program uses collects a media stream using HTML5.  The video stream is then drawn onto an invisible Canvas element at a specified framerate.  The canvas is then resized and drawn onto a visible canvas.  As a separate step, the projected image is sent as a base-64-encoded, compressed JPEG to the server over a WebSocket connection.

Once the encoded image arrives at the server, it is then parsed as an array using Node.JS's [Buffer object](https://nodejs.org/api/buffer.html) (see also [StackOverflow](https://stackoverflow.com/questions/8609289)).  This array is then passed to an open Python process over TCP using the ZeroMQ message broker.  The Python process converts the unsigned 32-bit integer array to an unsigned 8-bit integer array which is then converted to a 3-dimensional numpy array and passed to OpenCV where it is displayed on screen.


##How do I use a camera on another device to gather data?
-----

You simply access the site on which you are hosting the server.

####Using another device over LAN requires an SSL Certificate.  How did I do that?
1. Install [openssl](https://slproweb.com/products/Win32OpenSSL.html) if on Windows
	* Don't forget to add it OpenSSL to your path

1. follow the instructions on [this page](http://pages.cs.wisc.edu/~zmiller/ca-howto/)
	* This [Stack Overflow post](https://stackoverflow.com/questions/991758/how-to-get-pem-file-from-key-and-crt-files) describes how to get the NodeJS prefered `.pem` files from

1. Edit the __\_config.json__ file to include your IP address.

1. Now you can host your node server over a LAN and collect data from a separate device.


__Note:__ If you host your site Google Cloud or Amazon Web Services, getting an SSL certificate is much easier and is explained in detail by the documentation of those services.


##TODO:
-----
- [ ] Put pictures into the README.md
- [ ] Add dynamic compression.