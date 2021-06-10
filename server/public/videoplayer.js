// Adapted from Stackoverflow:
// https://stackoverflow.com/questions/52514522/html5-video-how-to-seamlessly-play-several-videos-and-then-loop-the-sequence

// Get and create elements
var videoPlayer = document.getElementById('videoplayer');
var ts = document.getElementById('time');
videoA = document.createElement('video');
videoB = document.createElement('video');

// Set up video variables
videoA.next = videoB;
videoB.next = videoA;
videoA.autoplay = true;
videoB.style.display = 'none';
initVideo(videoA);
initVideo(videoB);

// Initial things for the beginning of page load
response = getNextVideo();
populateVideoFromResponse(videoA, response);
ts.textContent = videoA.text;
videoPlayer.appendChild(videoA);
videoPlayer.appendChild(videoB);

// Get the next video from the /video endpoint
function getNextVideo() {
    var response = $.ajax({
        type: 'get',
        contentType: 'Content-Disposition',
        url: '/video',
        dataType: "json",
        async: false
    }).responseJSON;
    if (response["timestamp"] === 0) {
        response["timestamp"] = "Not Available";
    } else {
        date = new Date(response["timestamp"]);
        response["timestamp"] = date.toLocaleTimeString('en-US');
    }
    return response;
}

// Use a response to set up a video
function populateVideoFromResponse(video, response) {
    video.src = response["video"];
    video.text = response["timestamp"];
    video._duration = response["duration"];
}

// Initialize a video
function initVideo(video) {
    formatVideo(video);
    video.muted = true;
    video.preload = 'auto';
    video.onplay = function () {
        response = getNextVideo()
        populateVideoFromResponse(this.next, response);
        this.next.pause();
        setTimeout(() => { killVideo(this) }, this._duration);
    }
}

// Format a video
function formatVideo(id)
{
    id.setAttribute("width", "100%");
    id.setAttribute("height", "auto");
    id.style.cssFloat = "center";
    id.setAttribute("name", "videos");
}

// Kill a video if timeout
function killVideo(video) {
    video.style.display = 'none';
    next = video.next;
    next.style.display = 'block';
    ts.textContent = next.text;
    next.play();
    delete video;
    newVideoElement = document.createElement('video');
    newVideoElement.style.display = 'none';
    next.next = newVideoElement;
    formatVideo(newVideoElement);
    initVideo(newVideoElement);
    videoPlayer.appendChild(newVideoElement);
}