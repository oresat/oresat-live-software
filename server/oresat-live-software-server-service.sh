#!/bin/bash
cd /usr/local/sbin/oresat-live-software-server/
sudo npm i
mkdir -p public/video
sudo node index.js video/
