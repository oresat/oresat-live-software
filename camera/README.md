# camera

The software in this folder uses `v4l` and `ffmpeg` to create low-fps videos with H.264 encoding.

### Dependencies

- [Python 3](https://www.python.org/)
- [CMake](https://cmake.org/)
- [`ffmpeg`](https://ffmpeg.org/)
- [`v4l-utils`](https://www.linuxtv.org/wiki/index.php/V4l-utils)
- [`libv4l-dev`](https://packages.debian.org/sid/libv4l-dev)

### Compilation

The software depends on building `capture.c` (which actually interfaces with the camera) as follows.

```
mkdir build
cd build && cmake ..
make
```

This binary can be used on its own if needed.

```
./capture <video device> <width in px> <height in px> <frames per second> <capture duration> <output directory>
./capture /dev/video1/ 640 480 1 3 output
```

Note that the output directory should already exist if you use the `capture` binary.

### Usage

Everything is coordinated through `camera.py`, which has a command-line interface for controlling parameters. Run `python3 camera.py -h` to see a full list. The defaults are set to reasonably work with the Sony IMX214 USB camera for OreSat Live, running on a BeagleBone Black.

The required parameters are total duration `-t`, image output directory `-io`, and video output directory `-vo`. When run, the script will start capturing, encoding, and storing raw frames and videos in the specified directories.