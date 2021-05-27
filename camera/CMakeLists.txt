cmake_minimum_required(VERSION 3.2)
project(camera)

file(GLOB sources ./*)

add_executable(capture ${sources})
target_link_libraries(capture v4l1 v4l2)
