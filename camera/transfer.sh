#!/bin/bash

SOURCE=$(echo $1 | sed 's:/*$::')
DEST=$(echo $2 | sed 's:/*$::')
TIME=$3

for FILE in $SOURCE/*
do
    mv $FILE $DEST/
    sleep $TIME
done
