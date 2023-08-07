#!/bin/bash
/usr/sbin/startmonitor && /usr/bin/rx --dev mon0 /usr/local/sbin/oresat-live-software-server/public/video/ -e mp4 -v &
cd /usr/local/sbin/oresat-live-software-server/
sudo npm i
mkdir -p public/video
sudo node index.js video/
