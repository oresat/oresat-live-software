cmake_minimum_required(VERSION 3.2)
project(camera)

file(GLOB sources ./*)

add_executable(imagecapture ${sources})

