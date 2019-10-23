#!/bin/bash

rm -f wwwroot/dist/*.json
rm -f wwwroot/dist/*.hot-update.json
rm -f wwwroot/dist/*.js
rm -f wwwroot/dist/*.js.map
rm -f wwwroot/dist/*.css
rm -f wwwroot/dist/*.css.map
rm -rf wwwroot/dist/configs
# NODE_OPTIONS=--max_old_space_size=8192 NODE_ENV=development webpack --config config/webpack.dev.conf.js
node node_modules/webpack/bin/webpack.js --config config/webpack.base.conf.js --env.prod