# server

The software in this folder creates a Node.js web server to host OreSat Live streams.

### Dependencies

Once you have [Node.js](https://nodejs.org/en/), you can simply run `npm install` to get all the dependencies. You can run this on your local machine, but it's designed to be run on a [Raspberry Pi Zero W](https://www.raspberrypi.org/products/raspberry-pi-zero-w/) through an access point connection. See [below](#running-on-a-raspberry-pi-zero-w) for more details.

### Usage

```
node index.js <video directory>/
```

Depending on your setup, you may also need `sudo`. This will start the server, which goes through MP4 videos in the specified directory and plays them in chronological order, according to the file timestamps.

Note that the specified video directory must be in the `public` folder. The path is also specified relative to `public`. For example, to use the test videos contained in `public/test-stream/`, you would run `node index.js test-stream/`.

You can control the host and port the server runs on by specifying the `HOST` and `PORT` environment variables. By default, the server will start at `0.0.0.0:80`.

The two files `index.js` and `public/videoplayer.js` do most of the heavy lifting. The former contains the server-side code, which continually updates the current video in the stream and provides a `/video` endpoint that clients can query to access current stream information. The latter contains the client-side code that sets up the HTML elements and queries the server to present the stream.

### Running on a Raspberry Pi Zero W

To set up a fresh Raspberry Pi Zero W as an open wireless access point, follow [this](https://github.com/TomHumphries/RaspberryPiHotspot) README up to the "Configuring the Node.js server to start on boot" section.

Once you have that set up, you should be able to run this server on the RasPi with `HOST` set to `oresat.live` (or whatever else you want) and `PORT` set to whatever you specified with `iptables` (3000 if you followed the tutorial exactly).

Then with another device, you should be able to connect to the RasPi's access point, and then navigate to `oresat.live` in the browser to view the stream.

_To-do: turn this into a Bash script._