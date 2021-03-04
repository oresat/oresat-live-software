/*
*  imagecapture.c
*
*  This program will take in the video device, res, fps, and capture duration
*  It will output jpeg images corresponding to the input setting
*
*  NOTES:
    Uses v4l2, jpeglib for image processing and conversion
*/

#include <stdio.h>
#include <stdlib.h>
#include <string.h>



//Globals for input args :O
char * device;
char * width;
char * height;
char * fps;
char * capture_duration;

//checkinput
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

int checkinput(char * device, char * width, char *height, char*fps, char *capture_duration);
int checkinput(char * device, char * width, char *height, char*fps, char *capture_duration){

    int is_valid = 1;
    float ratiohelper = 4.0/3.0;

    //Convert input strings to int/floats
    //TODO: validate atoi/atof
    float widthint = atof(width);
    float heightint = atof(height);
    int fpsint = atoi(fps);
    int captureint = atoi(capture_duration);

    //Calculate aspect ratio from width and height
    float ratio = widthint / heightint;

    //Check if the video device has the right name
    if(strcmp(device, "/dev/video0") != 0){
        printf("INPUT ERROR: This is probably the wrong video device(unless you're testing)\n");
        is_valid = 0;
    }
    //Check if the width is within limits of the camera resolution(until we know limits of dxwifi)
    if(widthint < 160 || widthint > 4160 ){
        printf("INPUT ERROR: Width is too large or too small\n");
        is_valid = 0;
    }
    //Check if the height is within limits of the camera resolution(until we know limits of dxwifi)
    if(heightint < 120 || heightint > 3120){
        printf("INPUT ERROR: Height is too large or too small\n");
        is_valid = 0;
    }
    //Check if correct aspect ratio is obtained given the w and h values
    if(ratio != ratiohelper){
        printf("INPUT ERROR: Image size must conform to 1.33/1 aspect ratio\n");
        
        is_valid = 0;
    }
    //check if fps is in the correct range for what we can transmit
    if(fpsint < 1 || fpsint > 9){
        printf("INPUT ERROR: Frames per second is too high or too low\n");
        is_valid = 0;
    }
    //check if the cap. duration is too long
    if(captureint < 1 || captureint > 600){
        printf("INPUT ERROR: Capture duration can't be over 10 minutes\n");
        is_valid = 0;
    }
    //return values based on valid inputs
    if(is_valid == 0){
        return 0;
    }

    else{
        return 1;
    }
}


int main(int argc, char *argv[]){
    device = argv[1];
    width = argv[2];
    height = argv[3];
    fps = argv[4];
    capture_duration = argv[5];
    
    if(!checkinput(device,width,height,fps,capture_duration)){
        printf("Input invalid! See error output\n");
        exit(EXIT_FAILURE);
    }

}


