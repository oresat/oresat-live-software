# Imports
import os
import sys
import time
import shutil
import argparse
import subprocess

# Make or overwrite the given directory
def fresh_dir(path):

    # Overwrite
    if os.path.exists(path):
        for f in os.listdir(path):
            p = os.path.join(path, f)
            try:
                shutil.rmtree(p)
                print("Removed directory: {}".format(f))
            except OSError:
                os.remove(p)
                print("Removed file: {}".format(f))
        print("Cleaned Directory: {}".format(path))
    else:
        # Make
        os.mkdir(path)
        print("Created new directory: {}".format(path))

# Main script
if __name__ == "__main__":

    # Set up argument parser
    # TODO: add complete sanity checks on user input
    parser = argparse.ArgumentParser(description = "Capture and encode low-fps videos.")
    parser.add_argument("-bin", "--binary", default = "./build/capture",
                        help = "Path to imagecapture binary.")
    parser.add_argument("-dev", "--device", default = "/dev/v4l/by-id/usb-Empia._UVC_Video_Device_12345678901234567890-video-index0",
                        help = "Path to video device.")
    parser.add_argument("-vx", "--video-x", type = int, default = 640,
                        help = "Horizontal resolution of video.")
    parser.add_argument("-vy", "--video-y", type = int, default = 480,
                        help = "Vertical resolution of video.")
    parser.add_argument("-fps", "--frames-per-second", dest = "fps", type = int, default = 4,
                        help = "Desired frames per second. (Note: this will probably only work at or under 10fps.)")
    parser.add_argument("-spv", "--seconds-per-video", dest = "spv", type = int, default = 3,
                        help = "Seconds per created video. Must divide total duration.")
    parser.add_argument("-br", "--bit-rate", type = int, default = 100,
                        help = "Bit rate of H.264 encoded videos.")
    parser.add_argument("-t", "--total-duration", type = int, required = True,
                        help = "Total capture duration, in seconds.")
    parser.add_argument("-io", "--image-output", required = True,
                        help = "Directory where raw frames should be stored. (Will create / overwrite.)")
    parser.add_argument("-vo", "--video-output", required = True,
                        help = "Directory where output videos should be stored. (Will create / overwrite.)")
    parser.add_argument("-del", "--delete-frames", default = False, action = "store_true",
                        help = "Delete the raw frames after completion.")

    # Parse arguments
    args = parser.parse_args()

    # Basic check -- make sure seconds per video divides total duration
    if args.total_duration % args.spv != 0:
        sys.exit("Seconds per video does not divide total duration.")

    # Make / overwrite directories
    fresh_dir(args.image_output)
    fresh_dir(args.video_output)

    # Figure out how many times to loop
    num_loops = args.total_duration // args.spv

    # Interpolate constant ffmpeg arguments
    ffmpeg_constants = "-c:v libx264 -b:v {}k -preset ultrafast -loglevel quiet -an -y".format(args.bit_rate)

    # Use a list to keep track of asynchronous ffmpeg calls
    procs = []

    # Make videos
    for i in range(num_loops):

        # Create strings
        img_dir = os.path.join(args.image_output, "{:04d}".format(i))
        vid_name = os.path.join(args.video_output, "output{:04d}.mp4".format(i))

        # Make directory for frames
        os.mkdir(img_dir)

        # Make commands
        capture_command = "{} {} {} {} {} {} {}".format(args.binary, args.device, args.video_x, args.video_y, args.fps, args.spv, img_dir)
        ffmpeg_command = "ffmpeg -framerate {} -i {} {} {}".format(args.fps, os.path.join(img_dir, 'frame%04d.ppm'), ffmpeg_constants, vid_name)

        # Call capture (blocking)
        print("Capturing frames for video {} of {}.".format(i + 1, num_loops))
        subprocess.call(capture_command.split())

        # Call ffmpeg (non-blocking)
        print("Starting encoding of video {} of {}.".format(i + 1, num_loops))
        procs.append(subprocess.Popen(ffmpeg_command.split()))

    # Wait for encoding to finish
    print("Waiting for encoding subprocesses to finish.")
    return_codes = [p.wait() for p in procs]
    print("Finished, videos available at: {}".format(args.video_output))

    # If requested, delete frames
    if args.delete_frames:
        shutil.rmtree(args.image_output)
        print("Deleted raw frames at: {}".format(args.image_output))