# camera.py
Script to integrate camera capture and video encoding together.

## Requires:
    Python
    ffmpeg
    v4l-utils
    libv4l-dev
    cmake
## Usage:
    To capture and encode video:

    python camera.py <frames to capture per second> <capture duration in seconds> <fps to encode videos> <bit rate for encoding>

## Example:
    python camera.py 3 5 2 250K

Will capture 3 frames per second for 5 seconds and then feed the frames into ffmpeg to encode video at 3 frames per second at a bit rate of 250,000.

Script may need to be modified if camera is not recognized.


# imagecapture.c

Software to interface with the Sony IMX214 USB camera.

## Compliation:

    mkdir build

    cd build && cmake ..

    make

## Usage:

    To capture raw, uncompressed frames:
        ./imagecapture <video device> <width in px> <height in px> <frames per second> <capture duration>

    Example:
    ./imagecapture /dev/video1/ 640 480 1 3



This will capture 1 image per second for three seconds at 640x480 on video device 1 (a usb webcam, a built in webcam might be video device 0)


## To use the program on a BeagleBone/fresh system you'll need the following dependancies:

    v4l-utils
    libv4l-dev
    cmake

## To install:

    sudo apt install v4l-utils
    sudo apt install libv4l-dev
    sudo apt install cmake
