// Adapted from Stackoverflow:
// https://stackoverflow.com/questions/52514522/html5-video-how-to-seamlessly-play-several-videos-and-then-loop-the-sequence

var videoPlayer = document.getElementById('videoplayer');
var idx = 0;

var vidSrc = [
    "testimages/one.mov",
    "testimages/two.mov",
    "testimages/three.mov",
    "testimages/four.mov"
]

videoA = document.createElement('video');
videoB = document.createElement('video');

videoA.next = videoB;
videoB.next = videoA;

initVideo(videoA);
initVideo(videoB);

videoA.autoplay = true;
videoA.src = vidSrc[idx];
videoPlayer.appendChild(videoA);

videoB.style.display = 'none';
videoPlayer.appendChild(videoB);

function initVideo(video)
{
    video.muted = true;
    video.preload = 'auto';
    
    video.onplay = function ()
    {
        // enables 'looping'
        idx = ++idx % vidSrc.length;        
        
        video.next.src = vidSrc[idx];
        video.next.pause();   
    }


    video.onended = function()
    {
        this.style.display = 'none';
        video.next.style.display='block';
        video.next.play()
    }

}