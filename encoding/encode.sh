# encode.sh
# 
# DESCRIPTION: assembles H.264-encoded video from individual 
# frames in data/frames with bitrate <600kbps
# EXECUTION: bash encode.sh $1 $2
#     $1: framerate of video
#     $2: video output filename

#!/bin/bash

# initialize variables
framerate=$1
filename=$2

# output temp.mkv file from input images and framerate
ffmpeg -framerate $framerate -i data/frames/image%03d.jpg temp.mkv

# two-pass H.264 encoding, this caps the video bitrate at ~600 kbps
ffmpeg -y -i temp.mkv -c:v libx264 -b:v 600k -pass 1 -an -f null /dev/nul && \
ffmpeg -i temp.mkv -c:v libx264 -b:v 600k -pass 2 $filename

# move video into proper folder
cp $filename data/video

# remove dummy files left behind by FFmpeg
rm ffmpeg2pass-0.log
rm ffmpeg2pass-0.log.mbtree
rm temp.mkv
rm $filename
