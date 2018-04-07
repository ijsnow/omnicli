#!/bin/bash

# Clean up
rm -rf ./dist
mkdir ./dist

yarn run lint
yarn run build:prod
