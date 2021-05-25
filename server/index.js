/*
*  index.js
*
*  DESCRIPTION: This file sets up the server, routed to the IP address
*  of the raspberry pi that's set up
*
*  NOTES: The IP address of the host may be different because of the IP address
*  that is associated with your own raspberry pi. More to come on that
*  later.
*/

const fs = require('fs');
const express = require('express');
const app = express();
const http = require('http').createServer(app);
//as of right now, 0.0.0.0 is the only IP address that works
const host = '0.0.0.0'; //'192.168.1.164'
const port = 80;

const videoPath = "testimages/";
global.lastModified = 0;
global.attempts = 0;
global.currentFile = ""; // TODO: Default with error / starting .mov?

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
});

app.get('/video', function (req, res) {
    // Only select files in video format.
    const VIDEO_REGEX = /\w+.mp4/;
    
    if (global.attempts > 10)
    {
        res.send('ended.mp4');
        return;
    }

    let dir = fs.readdirSync('public/' + videoPath, options = {"withFileTypes": true});
    var nextTime = null;
    var nextFile = null;
    
    for (const file of dir) {
        // Check if the file is a file & and if it ends in the REGEX ending
        if (!file.isFile() || file.name.search(VIDEO_REGEX) < 0) {
            continue;
        }

        let birthtime = fs.statSync('public/' + videoPath + file.name).birthtimeMs;
        
        if (birthtime > global.lastModified && (!nextTime || birthtime < nextTime)) {
            nextTime = birthtime;
            nextFile = file.name;
        }
        else if (birthtime === global.lastModified) {
            global.currentFile = file.name;
        }
    }

    if (!nextTime) {
        // Video has not been updated, increment and loop current file.
        global.attempts += 1;
        nextFile = global.currentFile;
    }
    else {
        // Video has been updated, update timestamp and reset attempts. 
        global.attempts = 0;
        global.lastModified = nextTime;
    }
    res.statusCode = 200;
    if (global.lastModified == 0) {
        // Waiting for Transmission - No media in directory yet.
        res.send('wait.mp4');
    }

    // CHANGE THIS PART IF YOU WANT THE LOOPS TO BE LONGER.
    else if (global.attempts < 5) {
        // Send valid video.
        res.send(videoPath + nextFile);
    }        
    else {
        // Send error video / 'awaiting transmission.'
        res.send('interrupt.mp4');
        global.attempts += 1;
    }  
});

/*
*  FUNCTION: server
*
*  DESCRIPTION. the function creates a server using createServer which is already implemented in 
*  JavaScript and then listens on the port and host specified on lines 14 and 15
*
*  ARGUMENTS: port and host. declared above
*  RETURNS: a log to the console to make sure your server is running
*/
http.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});
