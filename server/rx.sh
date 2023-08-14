#!/bin/bash
# Script sets up network interface monitor mode and then
# runs the rx command to write mp4 files to the public video directory
# accepts commandline options but also has defaults
# make sure monitor interface and public directory exist before running
# for dafault dir, make sure cwd is the oresat life software server install dir
dev=${1:-mon0}
video_dir=${2:-./public/video/}
format=mp4 
/usr/sbin/startmonitor && /usr/bin/rx --dev $dev $video_dir -e $format -v
