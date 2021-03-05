## camera

Software to interface with the Sony IMX214 USB camera.

Compliation(for now):

    gcc -o imagecapture imagecapture.c -lv4l1 -lv4l2

Usage:

    ./imagecapture <video device> <width in px> <height in px> <frames per second> <capture duration>

    Example:
    ./imagecapture /dev/video1/ 640 480 1 3
    
    This will capture 1 image per second for three seconds at 640x480 on video device 1 (a usb webcam, a built in webcam might be video device 0)