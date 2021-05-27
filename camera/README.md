# camera

The software in this folder uses `v4l` and `ffmpeg` to create low-fps videos with H.264 encoding.

### Dependencies

- Python 3
- `ffmpeg`
- `v4l-utils`
- `libv4l-dev`
- `cmake`

All of these should be readily available from your package manager. The directories `data/encode_img` and `data/videos` should also be made. *(To-do: detect and create these directories as needed in the script, or better yet make them user-specifiable.)*

### Compilation

The software depends on building `capture.c`, which actually interface with the camera, as follows.

```
mkdir build
cd build && cmake ..
make
```

This binary can be used on its own if needed.

```
./capture <video device> <width in px> <height in px> <frames per second> <capture duration>
./capture /dev/video1/ 640 480 1 3
```

### Usage

Everything is coordinated through `camera.py`, which has a command-line interface for controlling parameters. Run `python3 camera.py -h` to see a full list, though most of these are optional. The defaults are set to work with the Sony IMX214 USB camera for OreSat Live.

The required parameters are frames per second `-fps`, seconds per video `-spv`, bit rate `-br`, and total duration `-t`. The script will then automatically start putting videos in the `data/videos` directory.