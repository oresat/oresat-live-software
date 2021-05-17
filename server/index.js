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

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
});

app.get('/video', function (req, res) {
    const VIDEO_REGEX = '\w+.mov';
    var videos = null;
    
    var dir = fs.readdir(videoPath, options = {"withFileTypes": true}, (err, data) => {
        if (err) { console.log('error', err); }

        res.statusCode = 200;
        // TODO: Practice sending this .mov (or link to it)
        //going to comment this out for now for testing purposes
        //res.send('/four.mov'); //SUCCESS

        // TODO: After successfully sending mov link, return to /public/testimages

        // TODO: Find out the last modified date of the files.
        for (const file of data) {
            if (!file.isFile()) {
                continue;
            }
            if (!file.name.search(VIDEO_REGEX)) {
                continue;
            }

            let stat = fs.stat(videoPath + file.name, function (stat_err, stats) {
                if (stat_err) { console.log('error', stat_err); }

                var mtime = stats.mtime;
                console.log(videoPath + file.name, mtime); 
            });
        }      
        
        
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
