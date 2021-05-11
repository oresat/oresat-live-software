// Adapted from Stackoverflow:
// https://stackoverflow.com/questions/52514522/html5-video-how-to-seamlessly-play-several-videos-and-then-loop-the-sequence
var videoPlayer = document.getElementById('videoplayer');
FILE_PATH = "testimages/"

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
videoA.src = getNextVideo();
videoPlayer.appendChild(videoA);

videoB.style.display = 'none';
videoPlayer.appendChild(videoB);
lastModified =  0;

function getNextVideo()
{
    return vidSrc[0];
    
    /*
    files = fs.readdirSync(FILE_PATH, options.withFileTypes=true)
    console.log(files)
    for(const file in files) {
        if (lastModified < file.LastModified)
        {
            lastModified = file.LastModified;
            return FILE_PATH + file.name;
        }
    }
    */
}

function initVideo(video)
{
    video.muted = true;
    video.preload = 'auto';
    
    video.onplay = function ()
    {       
        video.next.src = getNextVideo();
        video.next.pause();   
    }

    video.onended = function()
    {
        this.style.display = 'none';
        video.next.style.display='block';
        video.next.play()
    }
}