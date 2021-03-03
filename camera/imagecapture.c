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


int checkinput(char * device, char * width, char *height, char*fps, char *capture_duration);
int checkinput(char * device, char * width, char *height, char*fps, char *capture_duration){

    int is_valid = 1;
    float ratiohelper = 4.0/3.0;

    float widthint = atof(width);
    float heightint = atof(height);
    int fpsint = atoi(fps);
    int captureint = atoi(capture_duration);
    float ratio = widthint / heightint;

    if(strcmp(device, "/dev/video0") != 0){
        printf("INPUT ERROR: This is probably the wrong video device(unless you're testing)\n");
        is_valid = 0;
    }

    else if(widthint < 160 || widthint > 4160 ){
        printf("INPUT ERROR: Width is too large or too small\n");
        is_valid = 0;
    }

    else if(heightint < 120 || heightint > 3120){
        printf("INPUT ERROR: Height is too large or too small\n");
        is_valid = 0;
    }

    else if(ratio != ratiohelper){
        printf("INPUT ERROR: Image size must conform to 1.33/1 aspect ratio");
        
        is_valid = 0;
    }
    
    else if(fpsint < 1 || fpsint > 9){
        printf("INPUT ERROR: Frames per second is too high or too low\n");
        is_valid = 0;
    }

    else if(captureint < 1 || captureint > 600){
        printf("INPUT ERROR: Capture duration can't be over 10 minutes\n");
        is_valid = 0;
    }

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


