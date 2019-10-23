#!/bin/bash

rm -f wwwroot/dist/* || true
rm -rf wwwroot/dist/cesium
rm -rf wwwroot/dist/images
# NODE_OPTIONS=--max_old_space_size=8192 NODE_ENV=development webpack --config config/webpack.dev.conf.js
NODE_OPTIONS=--max_old_space_size=8192 LOCAL_SERVER=1 NODE_ENV=development webpack-dev-server --config config/webpack.dev.conf.js --mode development
