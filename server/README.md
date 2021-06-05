# Server
*Authored by Abbie Utley and Alejandro Castaneda*

This software is made to run a Node JS web server on a Raspberry Pi Zero W displaying the OreSat Live video stream.

## Requirements
---
There are two elements to this web server. To have the full range of motion, please have a Raspberry Pi available, a smart phone. However, you can run this on a local machine with node installed.

To see dependencies, run `npm list` and to install, run `npm install` 

## Usage
---
This node server will listen to a directory (provided via. arguments) and look for any video files (*.mp4) to play. After installation, you can run the directory by doing 

### Important Files
`index.js` contains the server side code including setting up the server on a local IP, waiting for events delivered from the client, and updating the server to provide the most accurate file.

`videoplayer.js` contains the client-side code that will set up the video elements in the HTML, query the server for the video to play, and then present the  videos to users of the HTML site. 

`index.html` contains the webpage's HTML code for oresat.live.

`wait.mp4`, `interrupt.mp4`, `ended.mp4` are the default videos for error messages. 

`testimages/` is a sample test suite of videos created to ensure the video player is working in the expected manner. 

## Converting your Raspberry Pi to an Access Point
---
[todo] @Umair


