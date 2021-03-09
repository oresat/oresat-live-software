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

const http = require('http');
//as of right now, 0.0.0.0 is the only IP address that works
const host = '0.0.0.0'
const port = 80;

/*
*  FUNCTION: request_listener
*
*  DESCRIPTION: The function takes requests and responses from the server, and writes 
*  "Hello World" to the page.
*
*  ARGUMENTS: requests and responses
*  RETURNS: nothing
*/
const request_listener = function (req, res) {
    res.writeHead(200);
    res.end("Hello World");
};

/*
*  FUNCTION: server
*
*  DESCRIPTION. the function creates a server using createServer which is already implemented in 
*  JavaScript and then listens on the port and host specified on lines 14 and 15
*
*  ARGUMENTS: port and host. declared above
*  RETURNS: a log to the console to make sure your server is running
*/
const server = http.createServer(request_listener);
server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});
