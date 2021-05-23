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

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
});

app.get('/video', function (req, res) {
    // Only select files in video format.
    const VIDEO_REGEX = '\w+.mov';
    
    var dir = fs.readdir(videoPath, options = {"withFileTypes": true}, (err, data) => {
        if (err) { console.log('error', err); }

        var currentFile = null;
        var nextTime = null;
        var nextFile = null;
        
        for (const file of data) {
            // Check if the file is a file & and if it ends in the REGEX ending
            if (!file.isFile() || !file.name.search(VIDEO_REGEX)) {
                continue;
            }

            let mtime = fs.statSync(videoPath + file.name).mtime;

            if (mtime > global.lastModified && (!nextTime || mtime < nextTime)) {
                nextTime = mtime;
                nextFile = file.name;
                console.log("Found a sooner file:" + file.name);
            }
            else if (mtime == global.lastModified) {
                currentFile = file.name;
                console.log("Found the already playing file.");
            }

            console.log(file.name, mtime);
        }

        console.log("DEBUGGING: (currentFile, newTime, nextFile) " + currentFile + nextTime + nextFile);

        if (!nextTime) {
            global.attempts += 1;
            nextFile = currentFile;
        }
        else {
            global.attempts = 0;
            global.lastModified = nextTime;
        }
        if (global.attempts > 10) {
            nextFile = 'four.mov'; // TODO: Replace with some 'error' message.
        }
        
        res.statusCode = 200;
        res.send('testimages/' + nextFile);
    });
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
