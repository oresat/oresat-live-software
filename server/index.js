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

const videoPath = "public/testimages/";
global.lastModified = 0;
global.attempts = 0;
global.currentFile = ""; // TODO: Default with error / starting .mov?

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
});

app.get('/video', function (req, res) {
    // Only select files in video format.
    const VIDEO_REGEX = /\w+.mov/;
    
    let dir = fs.readdirSync(videoPath, options = {"withFileTypes": true});
    var nextTime = null;
    var nextFile = null;
    
    for (const file of dir) {
        // Check if the file is a file & and if it ends in the REGEX ending
        if (!file.isFile() || file.name.search(VIDEO_REGEX) < 0) {
            continue;
        }

        let birthtime = fs.statSync(videoPath + file.name).birthtimeMs;

        if (birthtime > global.lastModified && (!nextTime || birthtime < nextTime)) {
            nextTime = birthtime;
            nextFile = file.name;
        }
        else if (birthtime === global.lastModified) {
            global.currentFile = file.name;
        }
    }

    if (!nextTime) {
        global.attempts += 1;
        nextFile = global.currentFile;
    }
    else {
        global.attempts = 0;
        global.lastModified = nextTime;
    }

    res.statusCode = 200;
    if (global.attempts < 10) {
        res.send('testimages/' + nextFile);
    }        
    else {
        res.send('happy.mov'); // TODO: Replace with some 'error' message.
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
