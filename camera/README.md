## camera

Software to interface with the Sony IMX214 USB camera.

Compliation:

    mkdir build 
    
    cd build && cmake ..
    
    make 

Usage:

    To capture raw, uncompressed frames:
        ./imagecapture <video device> <width in px> <height in px> <frames per second> <capture duration>

    Example:
    ./imagecapture /dev/video1/ 640 480 1 3

    To capture and covert frames to valid jpegs:
        ./imagecapture <video device> <width in px> <height in px> <frames per second> <capture duration> && convert image*.ppm image.jpg
    
    Example:
    ./imagecapture /dev/video1 640 480 1 3 && convert image*.ppm image.jpg


This will capture 1 image per second for three seconds at 640x480 on video device 1 (a usb webcam, a built in webcam might be video device 0)
