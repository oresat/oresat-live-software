cmake_minimum_required(VERSION 3.2)
project(camera)

file(GLOB sources ./*)





add_executable(imagecapture ${sources})
set(CMAKE_CXX_LINK_FLAGS "-lv4l1 -lv4l2")
