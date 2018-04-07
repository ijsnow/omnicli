#!/bin/bash

# Clean up
rm -rf ./dist
mkdir -p ./dist/omnitest

cp ./omnitest/manifest.json ./dist/omnitest/manifest.json

$(npm bin)/concurrently "yarn run build:dev" "yarn run start:firefox" "yarn run watch"
