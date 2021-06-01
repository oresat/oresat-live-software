// Adapted from Stackoverflow:
// https://stackoverflow.com/questions/52514522/html5-video-how-to-seamlessly-play-several-videos-and-then-loop-the-sequence

var videoPlayer = document.getElementById('videoplayer');
var ts = document.getElementById('time');

videoA = document.createElement('video');
videoB = document.createElement('video');

formatVideo(videoA);
formatVideo(videoB);

videoA.next = videoB;
videoB.next = videoA;

initVideo(videoA);
initVideo(videoB);

videoA.autoplay = true;
nextVideo = getNextVideo();
videoA.src = nextVideo["video"];
ts.textContent = nextVideo["timestamp"];
videoPlayer.appendChild(videoA);

videoB.style.display = 'none';
videoPlayer.appendChild(videoB);

function getNextVideo()
{
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

function initVideo(video)
{
    video.muted = true;
    video.preload = 'auto';
    video.text = "Not Available";
    
    video.onplay = function ()
    {       
        nextVideo = getNextVideo()
        video.next.src = nextVideo['video'];
        video.next.pause();   
        video.next.text = nextVideo['timestamp'];
    }

    video.onended = function()
    {
        this.style.display = 'none';
        video.next.style.display='block';
        video.next.play()
        ts.textContent = video.next.text;
    }
}

function formatVideo(id) 
{
    id.setAttribute("width", "100%");
    id.setAttribute("height", "auto");
    id.style.cssFloat = "center";
    id.setAttribute("name", "videos");
}
