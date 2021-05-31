/*
*  capture.c
*
*  This program will take in the video device, res, fps, and capture duration
*  It will output raw frames of images corresponding to the input setting that will be converted later into jpegs
*
*  NOTE: uses v4l2 camera API
*/

// Includes
#include <fcntl.h>
#include <unistd.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <errno.h>
#include <sys/ioctl.h>
#include <sys/types.h>
#include <sys/time.h>
#include <sys/mman.h>
#include <libv4l2.h>
#include <linux/videodev2.h>

// Macro to clear memory
#define CLEAR(x) memset(&(x), 0, sizeof(x))

// Globals for input args :O
char * device;
char * width;
char * height;
char * fps;
char * capture_duration;
char * output_dir;

// Struct for capture buffer
struct capbuffer {
    void * start;
    size_t length;
};

/*
*  DESCRIPTION: Helper function to the camera API be talked to
*
*  ARGUMENTS
*   int fh: value to check camera device
*   int request: the request to be performed by camera api
*   void *arg: extra arg used dependent on request
*
*  RETURNS
*
*    void
*/
static void camctrl(int fh, int request, void *arg) {

    int returnvalue;
    do {
        returnvalue = v4l2_ioctl(fh, request, arg);
    } while (returnvalue == -1 && ((errno == EINTR) || (errno == EAGAIN)));

    if (returnvalue == -1) {
        printf("CAMERA ERROR: Camera controller failure\n");
        exit(EXIT_FAILURE);
    }

}

/*
*  DESCRIPTION: Function validates command line inputs based on our predetermined valid inputs
*
*  ARGUMENTS
*
*    char * device: the name/fs location of the usb camera (should always be video0 since there's only one camera)
*    char * width: Width in pixels of the images to be taken
*    char * height: Height in pixels of the iamges to be taken (ratio between W:H must be 1.33:1)
*    char * fps: how many frames (images) to capture per second the prgrom is running
*    char * capture_duration: The amount of time in seconds that the program will capture images
*
*  RETURNS
*
*    int: 1 or 0 depending on if inputs are all verified.
*/
int checkinput(char * device, char * width, char *height, char*fps, char *capture_duration) {

    // Basic variables
    int is_valid = 1;
    float ratiohelper = 4.0/3.0;

    // Convert input strings to int/floats
    // TODO: check return values
    float widthint = 0;
    float heightint = 0;
    int fpsint = 0;
    int captureint = 0;
    if (width != NULL && height != NULL && fps != NULL && capture_duration != NULL) {
        widthint = atof(width);
        heightint = atof(height);
        fpsint = atoi(fps);
        captureint = atoi(capture_duration);
    } else {
        printf("INPUT ERROR: Some input was NULL");
        exit(EXIT_FAILURE);
    }

    // Calculate aspect ratio from width and height
    float ratio = widthint / heightint;

    // Check if the width is within limits of the camera resolution
    if (widthint < 160 || widthint > 4160 ) {
        printf("INPUT ERROR: Width is too large or too small\n");
        is_valid = 0;
    }

    // Check if the height is within limits of the camera resolution
    if (heightint < 120 || heightint > 3120) {
        printf("INPUT ERROR: Height is too large or too small\n");
        is_valid = 0;
    }

    // Check if correct aspect ratio is obtained given the w and h values
    if (ratio != ratiohelper) {
        printf("INPUT ERROR: Image size must conform to 1.33/1 aspect ratio\n");
        is_valid = 0;
    }

    // Check if fps is in the correct range for what we can transmit
    if (fpsint < 1 || fpsint > 10) {
        printf("INPUT ERROR: Frames per second is too high (max: 10) or too low (min: 1)\n");
        is_valid = 0;
    }

    // Check if the cap. duration is too long
    if (captureint < 1 || captureint > 600) {
        printf("INPUT ERROR: Capture duration can't be over 600 seconds (10 minutes)\n");
        is_valid = 0;
    }

    // Return resulting valid value
    return is_valid;
}

//TODO: error checking
int main(int argc, char *argv[]) {

    // Check that CLI arguments exist
    for (int i = 0; i < 7; ++i) {
        char * temp = argv[i];
        if (temp == NULL) {
            printf("INPUT ERROR: Missing command line field (or field was NULL)\n");
            exit(EXIT_FAILURE);
        }
    }

    // Get command line arguments
    device = argv[1];
    width = argv[2];
    height = argv[3];
    fps = argv[4];
    capture_duration = argv[5];
    output_dir = argv[6];

    // Validate inputs
    if (!checkinput(device, width, height, fps, capture_duration)) {
        printf("Input invalid! See error output\n");
        exit(EXIT_FAILURE);
    }

    // Calculate total number of images
    float numberofimages = 0;
    if (fps != NULL && capture_duration != NULL) {
        int f = atoi(fps);
        int cd = atoi(capture_duration);
        numberofimages = f * cd;
    }

    // Declare some variables
    struct v4l2_format format;
    struct v4l2_buffer vidbuffer;
    struct v4l2_requestbuffers request;
    enum v4l2_buf_type buffertype;
    fd_set framedataset;
    struct timeval timevalue;
    int r;
    int fd = -1;
    unsigned int i, numberofbuffers;
    char ppmname[256];
    FILE *fout;
    struct capbuffer *buffers;

    // Open video device, exit if device can't be opened
    fd = v4l2_open(device, O_RDWR | O_NONBLOCK, 0);
    if (fd < 0){
        printf("CAMERA ERROR: Video device cannot be opened\n");
        exit(EXIT_FAILURE);
    }

    // Set up v4l format fields for when image capture begins
    CLEAR(format);
    format.type = V4L2_BUF_TYPE_VIDEO_CAPTURE;
    format.fmt.pix.width = atoi(width);
    format.fmt.pix.height = atoi(height);
    format.fmt.pix.pixelformat = V4L2_PIX_FMT_RGB24;
    format.fmt.pix.field = V4L2_FIELD_INTERLACED;
    camctrl(fd, VIDIOC_S_FMT, &format);

    // Request buffers from camera api
    CLEAR(request);
    request.count = 2;
    request.type = V4L2_BUF_TYPE_VIDEO_CAPTURE;
    request.memory = V4L2_MEMORY_MMAP;
    camctrl(fd, VIDIOC_REQBUFS, &request);

    // Set up buffers and memory maps
    buffers = calloc(request.count, sizeof(*buffers));
    for (numberofbuffers = 0; numberofbuffers < request.count; ++numberofbuffers) {
        CLEAR(vidbuffer);
        vidbuffer.type = V4L2_BUF_TYPE_VIDEO_CAPTURE;
        vidbuffer.memory = V4L2_MEMORY_MMAP;
        vidbuffer.index = numberofbuffers;
        camctrl(fd, VIDIOC_QUERYBUF, &vidbuffer);
        buffers[numberofbuffers].length = vidbuffer.length;
        buffers[numberofbuffers].start = v4l2_mmap(NULL, vidbuffer.length, PROT_READ | PROT_WRITE, MAP_SHARED, fd, vidbuffer.m.offset);
        if (MAP_FAILED == buffers[numberofbuffers].start) {
            printf("MEMORY ERROR: Buffer mapping failed\n");
            exit(EXIT_FAILURE);
        }
    }

    for (i = 0; i < numberofbuffers; ++i) {
        CLEAR(vidbuffer);
        vidbuffer.type = V4L2_BUF_TYPE_VIDEO_CAPTURE;
        vidbuffer.memory = V4L2_MEMORY_MMAP;
        vidbuffer.index = i;
        camctrl(fd, VIDIOC_QBUF, &vidbuffer);
    }
    buffertype = V4L2_BUF_TYPE_VIDEO_CAPTURE;

    // Image capture begin
    camctrl(fd, VIDIOC_STREAMON, &buffertype);

    // Calculate the time to sleep for proxy fps value
    float timefrac = (float) 1 / atoi(fps);
    timefrac = timefrac * 1000000;
    int usecstosleep = (int) timefrac;

    // Capture images here
    for (i = 0; i < numberofimages; i++) {

        do {
            FD_ZERO(&framedataset);
            FD_SET(fd, &framedataset);
            timevalue.tv_sec = 2;
            timevalue.tv_usec = 0;
            r = select(fd + 1, &framedataset, NULL, NULL, &timevalue);
        } while ((r == -1 && (errno = EINTR)));

        if (r == -1) {
            printf("CAPTURE ERROR: Frame data could not be selected\n");
            return errno;
        }

        // Fill buffer with frame data
        CLEAR(vidbuffer);
        vidbuffer.type = V4L2_BUF_TYPE_VIDEO_CAPTURE;
        vidbuffer.memory = V4L2_MEMORY_MMAP;
        camctrl(fd, VIDIOC_DQBUF, &vidbuffer);

        // Prepare ppm output
        sprintf(ppmname, "%s/frame%04d.ppm", output_dir, i);
        fout = fopen(ppmname, "w");
        if(!fout) {
            printf("OUTPUT ERROR: Cannot create ppm\n");
            exit(EXIT_FAILURE);
        }

        // Fill ppm file with frame data
        fprintf(fout, "P6\n%d %d 255\n", format.fmt.pix.width, format.fmt.pix.height);
        fwrite(buffers[vidbuffer.index].start, vidbuffer.bytesused, 1, fout);
        fclose(fout);

        // Sleep until next capture
        camctrl(fd, VIDIOC_QBUF, &vidbuffer);
        usleep(usecstosleep);
    }

    // Cleanup
    buffertype = V4L2_BUF_TYPE_VIDEO_CAPTURE;
    camctrl(fd, VIDIOC_STREAMOFF, &buffertype);
    for (i = 0; i < numberofbuffers; ++i) v4l2_munmap(buffers[i].start, buffers[i].length);
    v4l2_close(fd);
    return 0;
}
