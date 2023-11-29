# Table of Contents:
- [Camera](#camera)
  - [Dependencies](#dependencies)
  - [Quick Build/Install instructions](#quick-buildinstall-instructions)
  - [Usage](#usage)
  - [Example Manual Usage](#example-manual-usage)

# Camera

The software in this folder uses `v4l` and `ffmpeg` to create low-fps videos with H.264 encoding.

## Dependencies

- [`Python 3`](https://www.python.org/)
- [`CMake`](https://cmake.org/)
- [`ffmpeg`](https://ffmpeg.org/)
- [`v4l-utils`](https://www.linuxtv.org/wiki/index.php/V4l-utils)
- [`libv4l-dev`](https://packages.debian.org/sid/libv4l-dev)


## Quick Build/Install instructions

This one liner will set up the required directories, clone the repo, make the build dir and output directories, run the build, including the package build and then install the built package:

```
mkdir -p /home/debian/src && \
  cd /home/debian/src && \
  git clone https://github.com/oresat/oresat-live-software.git && \
  cd oresat-live-software/camera && \
  mkdir build && \
  sudo mkdir -p /oresat-live-output/{frames,videos} && \
  cd build && \
  cmake .. && \
  make && \
  make package && \
  sudo dpkg -i *.deb
```
Note: if you need to checkout a specific branch for this repo you can pass the -b BRANCHNAME flag.

## Usage

This binary can be used on its own if needed:

```
./capture <video device> <width in px> <height in px> <frames per second> <capture duration> <output directory>
./capture /dev/video1/ 640 480 1 3 output
```

Note that the output directory should already exist if you use the `capture` binary.

Everything is coordinated through `camera.py`, which has a command-line interface for controlling parameters.

Run `python3 camera.py -h` to see a full list.

The defaults are set to reasonably work with the Sony IMX214 USB camera for OreSat Live, running on a BeagleBone Black 3.

The required parameters are total duration `-t`, image output directory `-io`, and video output directory `-vo`.

When run, the script will start capturing, encoding, and storing raw frames and videos in the specified directories.


## Example Manual Usage

NOTE: Since the /oresat-live-output/frames, /oresat-live-output/video directories exist and are owned by root, you will need to run these commands as root.

The capture binary will be in /usr/bin/capture, which is within the PATH variable.

Test making some frame captures:

```
sudo capture /dev/video0 640 480 1 10 /oresat-live-output/frames/
```

Confirm frames were created:

```
$ sudo ls /oresat-live-output/frames/
frame0000.ppm frame0001.ppm frame0002.ppm frame0003.ppm frame0004.ppm frame0005.ppm frame0006.ppm frame0007.ppm frame0008.ppm frame0009.ppm
```

If you used the same directory tree for sources as indicated in the setup instructions above, camera.py should be in /home/debian/src/oresat-dxwifi-software/camera/

Test making some video:

```
cd /home/debian/src/oresat-dxwifi-software/camera/ &&
  sudo python3 camera.py --bin /usr/bin/capture -t 4 -spv 4 -fps 3 -io /home/debian/output/frames -vo /home/debian/output/videos
```

NOTE: The above camera.py command starts an entirely new capture and does not reuse the old frames

Confirm it created the video:
```
$ sudo ls /oresat-live-output/video/
output0000.mp4
```
