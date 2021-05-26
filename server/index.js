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

const sleep = require('sleep');
const fs = require('fs');
const express = require('express');
const app = express();
const http = require('http').createServer(app);
//as of right now, 0.0.0.0 is the only IP address that works
const host = '0.0.0.0'; //'192.168.1.164'
const port = 80;

// Only select files in video format.
const videoPath = "testimages/";
const VIDEO_REGEX = /\w+.mp4/;
global.currentTimestamp = 0;
global.currentFile = "wait.mp4"; // Set to waiting by default.

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
});

app.get('/video', function (req, res) {
    // Send the video.
    res.statusCode = 200;
    res.send(global.currentFile);
    console.log(global.currentTimestamp, global.currentFile);
});

async function startServer() {   
    // Thank you to pass by reference :')  
    var arg = {}
    arg.attempts = 0;
    
    while(arg.attempts < 10) {
        await updateCurrentFile(arg);
    }
    global.currentFile = 'ended.mp4';
    return;
}

async function updateCurrentFile(arg) {
    // Transmission has not begun yet.
    if(global.currentTimestamp == 0) {
        global.currentFile = "wait.mp4";
        arg.attempts = 0; // Keep attempts at 0. 
    }
    
    // Transmission has ended, or enough errors have
    // passed through causing an end of transmission.
    if (arg.attempts >= 10)
    {
        return;
    }
    
    const dir = fs.readdirSync('public/' + videoPath, options = {"withFileTypes": true});
    
    // Find the next file & timestamp.
    var nextTime = null;
    var nextFile = null;
    
    for (const file of dir) {
        // Check if the file is a file & and if it ends in the REGEX ending
        if (!file.isFile() || file.name.search(VIDEO_REGEX) < 0) {
            continue;
        }
        
        // Find the files' creation date. 
        let birthtime = fs.statSync('public/' + videoPath + file.name).birthtimeMs;
        
        // If file is later than the current latest file, and less than the next best file,
        // set this to the next best file.
        if (birthtime > global.currentTimestamp && (!nextTime || birthtime < nextTime)) {
            nextTime = birthtime;
            nextFile = file.name;
        }
    }
    
    // If video has been updated, reset attempts, otherwise increment.
    if(!nextTime){
        arg.attempts += 1;
        
        // Send 'Interupted' transmission if looping too much.
        if (arg.attempts < 5) {
            global.currentFile = 'interrupt.mp4';
        }  
    } else {
        arg.attempts = 0;
        global.currentTimestamp = nextTime;
        global.currentFile = videoPath + nextFile;
    }

    // Sleep for Video Length.
    return new Promise(resolve => {
        setTimeout(() => { return resolve(1); }, getDurationOfVideoMs(global.currentFile));
    });
}

function getDurationOfVideoMs(filepath) {
    // Reading duration of an mp4 from NodeJS:
    // Adapted from https://gist.github.com/Elements-/cf063254730cd754599e
    var buff = new Buffer.alloc(100);
    const fd = fs.openSync(__dirname + '/public/testimages/' + 'TEST_ONE.mp4');
    fs.readSync(fd, buff);
    var start = buff.indexOf(new Buffer.from('mvhd')) + 17;
    var timeScale = buff.readUInt32BE(start, 4);
    var duration = buff.readUInt32BE(start + 4, 4);
    return Math.floor(duration/timeScale) * 1000;
}

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
startServer();
