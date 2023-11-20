/*
*  index.js
*
*  DESCRIPTION: Set up the server that updates the current video
*  to stream, routed to the specified address.
*
*  NOTES: Use HOST and PORT environment variables to customize.
*/

// Load modules
const fs = require('fs');
const ffprobe = require('node-ffprobe');
const ffprobeInstaller = require('@ffprobe-installer/ffprobe');
const express = require('express');
const app = express();
const http = require('http').createServer(app);

// Grab host and port, default to local
const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || 80;

// Paths to video messages
const WAIT_VIDEO = "messages/wait.mp4";
const INTERUPT_VIDEO = "messages/interrupt.mp4";

// Terminate if the directory the video files are coming from is not specified.
if (process.argv.length != 3) {
    console.log("Please include the directory to read video files from.");
    console.log("node index.js [directory]");
    process.exit(1);
}

// Grab directory path and regex for MP4 files
const VIDEO_PATH = process.argv[2];
const VIDEO_REGEX = /\w+.mp4/;

// Global defaults to start with (waiting video, 3s sleeps)
global.currentTimestamp = 0;
global.currentFile = WAIT_VIDEO;
global.duration = 10;

// Basic setup
app.use(express.static(__dirname + '/public'));
app.get('/', (req, res) => {});

// Video endpoint grabs the current file
app.get('/video', function (req, res) {
    // Send the video.
    res.statusCode = 200;
    console.log(global.currentTimestamp, global.currentFile, global.duration);
    if (global.currentFile == WAIT_VIDEO || global.currentFile == INTERUPT_VIDEO ) {
        res.send({ 'video': global.currentFile, 'timestamp': 0 , 'duration': global.duration });
    } else {
        res.send({ 'video': global.currentFile, 'timestamp': global.currentTimestamp , 'duration': global.duration });
    }
});

// Start up the server
async function startServer() {
    // Start out with no attempts
    var arg = {}
    arg.attempts = 0;
    // Wait for 10 attempts before ending stream
    while (true) {
        await updateCurrentFile(arg);
    }
}

// Update the current file
async function updateCurrentFile(arg) {
    // Get files to look through
    const dir = fs.readdirSync('public/' + VIDEO_PATH, options = {"withFileTypes": true});
    var nextTime = null;
    var nextFile = null;

    // Find the next file & timestamp.
    for (const file of dir) {

        // Check if the file is a file & and if it ends in the REGEX ending
        if (!file.isFile() || file.name.search(VIDEO_REGEX) < 0) {
            continue;
        }

        // Find the creation date.
        let mtime = fs.statSync('public/' + VIDEO_PATH + file.name).mtimeMs;

        // If file is later than the current file, and less than the next best file, set this to the next best file.
        if (mtime > global.currentTimestamp && (!nextTime || mtime < nextTime)) {
            nextTime = mtime;
            nextFile = file.name;
        }
    }

    // If video has been updated, reset attempts, otherwise increment
    // also send 'interupted' transmission if looping too much.
    if (!nextTime) {
        arg.attempts += 1;
        if (global.currentTimestamp == 0) {
            global.currentFile = WAIT_VIDEO;
            arg.attempts = 0;
        } else if (arg.attempts > 5) {
            global.currentFile = INTERUPT_VIDEO;
        }
    } else {
        arg.attempts = 0;
        global.currentTimestamp = nextTime;
        global.currentFile = VIDEO_PATH + nextFile;
    }

    // Get video duration, if video is too corrupted interrupt instead
    let duration = await getDurationOfVideoMs(__dirname + '/public/' + global.currentFile);
    if (duration === 0) {
        global.currentFile = INTERUPT_VIDEO;
        duration = await getDurationOfVideoMs(__dirname + '/public/' + global.currentFile);
    }

    // Sleep for duration
    global.duration = duration;
    return new Promise(resolve => {
        setTimeout(() => { return resolve(1); }, duration);
    });
}
// Get duration of video
async function getDurationOfVideoMs(filepath) {
    ffprobe.FFPROBE_PATH = ffprobeInstaller.path;
    return new Promise(resolve => {
        return ffprobe(filepath).then(data => {
            if (("format" in data) && ("duration" in data["format"])) {
                resolve(data["format"]["duration"] * 1000);
            } else {
                console.log("Invalid File: " + global.currentFile);
                resolve(0);
            }
        }).catch(error => {
            console.log(error);
            resolve(0);
        });
    });
}
// Set up listening
http.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});
// Start the server
startServer();
