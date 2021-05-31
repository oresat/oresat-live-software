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
        shutil.rmtree(path)
        print(f"Deleted existing directory: {path}")

    # Make
    os.mkdir(path)
    print(f"Created new directory: {path}")

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
    parser.add_argument("-fps", "--frames-per-second", dest = "fps", type = int, required = True,
                        help = "Desired frames per second. (Note: this will probably only work at or under 10fps.)")
    parser.add_argument("-spv", "--seconds-per-video", dest = "spv", type = int, required = True,
                        help = "Seconds per created video. Must divide total duration.")
    parser.add_argument("-br", "--bit-rate", type = int, required = True,
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
    ffmpeg_constants = f"-c:v libx264 -b:v {args.bit_rate}k -preset ultrafast -loglevel quiet -an -y"

    # Use a list to keep track of asynchronous ffmpeg calls
    procs = []

    # Make videos
    for i in range(num_loops):

        # Create strings
        img_dir = os.path.join(args.image_output, f"{i:04d}")
        vid_name = os.path.join(args.video_output, f"output{i:04d}.mp4")

        # Make directory for frames
        os.mkdir(img_dir)

        # Make commands
        capture_command = f"{args.binary} {args.device} {args.video_x} {args.video_y} {args.fps} {args.spv} {img_dir}"
        ffmpeg_command = f"ffmpeg -framerate {args.fps} -i {os.path.join(img_dir, 'frame%04d.ppm')} {ffmpeg_constants} {vid_name}"

        # Call capture (blocking)
        print(f"Capturing frames for video {i + 1} of {num_loops}.")
        subprocess.call(capture_command.split())

        # Call ffmpeg (non-blocking)
        print(f"Starting encoding of video {i + 1} of {num_loops}.")
        procs.append(subprocess.Popen(ffmpeg_command.split()))

    # Wait for encoding to finish
    print(f"Waiting for encoding subprocesses to finish.")
    return_codes = [p.wait() for p in procs]
    print(f"Finished, videos available at: {args.video_output}")

    # If requested, delete frames
    if args.delete_frames:
        shutil.rmtree(args.image_output)
        print(f"Deleted raw frames at: {args.image_output}")