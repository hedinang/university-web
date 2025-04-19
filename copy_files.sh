#!/bin/bash

# Local directory containing files
LOCAL_DIR="/build"

# Docker container name or ID
CONTAINER_ID="authentication-web"

# Destination directory in the container
CONTAINER_DIR="/usr/share/nginx/html"

# Iterate over all files in the local directory
for file in "$LOCAL_DIR"/*; do
  # Check if it's a file (not a directory)
  if [ -f "$file" ]; then
    # Extract the filename from the path
    filename=$(basename "$file")

    # Copy the file to the container
    docker cp "$file" "$CONTAINER_ID:$CONTAINER_DIR/$filename"
  fi
done
