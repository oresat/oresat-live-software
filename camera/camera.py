import threading
import subprocess
  
# global variable x
x = 0
  
def cam_capture():
	subprocess.call(["build/./imagecapture", "/dev/v4l/by-id/usb-Empia._UVC_Video_Device_12345678901234567890-video-index0", "640", "480", "2", "5"])
  
def encode_vid():
    filename = "data/videos/output0" + str(x) + ".mp4"
    subprocess.call(["ffmpeg", "-framerate", "2", "-i", "data/encode_img/image%03d.ppm", "-c:v", "libx264", "-b:v", "250k", "-an", filename])
  
def main():
    # creating threads
    t1 = threading.Thread(target=encode_vid)
    t2 = threading.Thread(target=cam_capture)
  
    # start threads
    t1.start()
    t2.start()
  
    # wait until threads finish their job
    
    t1.join()
    t2.join()
  
if __name__ == "__main__":
    for each in range(5):
        main()
        x += 1
