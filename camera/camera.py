# Imports
import sys
import time
import argparse
import threading
import subprocess

# Global variables
ARGS = None
NUM = 0

# Capture images for a single video
def capture_img():
    subprocess.call([ARGS.binary, ARGS.device, str(ARGS.video_x), str(ARGS.video_y), str(ARGS.fps), str(ARGS.spv)])

# Encode single video
def encode_vid():
    filename = f"data/videos/output{NUM:04d}.mp4"
    subprocess.call(["ffmpeg", "-framerate", str(ARGS.fps), "-i", "data/encode_img/image%03d.ppm", "-c:v", "libx264", "-b:v", f"{ARGS.bit_rate}k",
                     "-preset", "ultrafast", "-loglevel", "quiet", "-an", "-y", filename])

# Do a single multithreaded image capture + video encode
def make_video():

    # Create threads
    t1 = threading.Thread(target = capture_img)
    t2 = threading.Thread(target = encode_vid)

    # Start threads (with a delay)
    t1.start()
    time.sleep(0.2)
    t2.start()

    # Wait until threads finish their job
    t1.join()
    t2.join()

# Main script
if __name__ == "__main__":

    # Set up argument parser
    # TODO: add sanity checks on user input
    parser = argparse.ArgumentParser(description = "Capture and encode low-fps videos.")
    parser.add_argument("-bin", "--binary", default = "./build/capture",
                        help = "Path to imagecapture binary.")
    parser.add_argument("-dev", "--device", default = "/dev/v4l/by-id/usb-Empia._UVC_Video_Device_12345678901234567890-video-index0",
                        help = "Path to video device.")
    parser.add_argument("-vx", "--video-x", type = int, default = 640,
                        help = "Horizontal resolution of video.")
    parser.add_argument("-vy", "--video-y", type = int, default = 480,
                        help = "Vertical resolution of video.")
    parser.add_argument("-fps", "--frames-per-second", dest = "fps", type = int, required = True,
                        help = "Desired frames per second. (Note: this will probably only work at or under 10fps.)")
    parser.add_argument("-spv", "--seconds-per-video", dest = "spv", type = int, required = True,
                        help = "Seconds per created video. Must divide total duration.")
    parser.add_argument("-br", "--bit-rate", type = int, required = True,
                        help = "Bit rate of H.264 encoded videos.")
    parser.add_argument("-t", "--total-duration", type = int, required = True,
                        help = "Total capture duration, in seconds.")

    # Parse arguments
    ARGS = parser.parse_args()

    # Basic check -- make sure seconds per video divides total duration
    if ARGS.total_duration % ARGS.spv != 0:
        sys.exit("Seconds per video does not divide total duration.")

    # Figure out how many times to loop
    num_loops = ARGS.total_duration // ARGS.spv

    # Make videos
    for i in range(num_loops):
        make_video()
        NUM += 1
        print(f"Finished video {i + 1} of {num_loops}.")
