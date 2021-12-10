#!/bin/bash
# Copyright (c) 2015-present, Facebook, Inc.
#
# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.

# ******************************************************************************
# This is an end-to-end test intended to run on CI.
# You can also run it locally but it's slow.
# ******************************************************************************

# Source shared functions/vars and setup
source $(dirname "$0")/_setup.sh

# ******************************************************************************
# First, publish the monorepo.
# ******************************************************************************

# Start the local NPM registry
startLocalRegistry "$root_path"/test/e2e/_verdaccio.yaml

# Publish the monorepo
publishToLocalRegistry

# ******************************************************************************
# Now that we have published them, create a clean app folder and install them.
# ******************************************************************************

# Install the app in a temporary location
cd $temp_app_path
npx create-react-app test-kitchensink --template=file:"$root_path"/test/e2e/fixtures/kitchensink

# Install the test module
cd "$temp_module_path"
npm install test-integrity@^2.0.1

# ******************************************************************************
# Now that we used create-react-app to create an app depending on react-scripts,
# let's make sure all npm scripts are in the working state.
# ******************************************************************************

# Enter the app directory
cd "$temp_app_path/test-kitchensink"

# In kitchensink, we want to test all transforms
export BROWSERSLIST='ie 9'

# ******************************************************************************
# Finally, let's check that everything still works after ejecting.
# ******************************************************************************
if [[ "$EJECT" == "true" ]]; then
  echo yes | npm run eject
fi

# Test the build
REACT_APP_SHELL_ENV_MESSAGE=fromtheshell \
  PUBLIC_URL=http://www.example.org/spa/ \
  npm run build

# Check for expected output
exists build/*.html
exists build/static/js/main.*.js

# Unit tests
# https://facebook.github.io/jest/docs/en/troubleshooting.html#tests-are-extremely-slow-on-docker-and-or-continuous-integration-ci-server
REACT_APP_SHELL_ENV_MESSAGE=fromtheshell \
  NODE_ENV=test \
  npm test -- --no-cache --runInBand --testPathPattern=src

# Prepare "development" environment
tmp_server_log=`mktemp`
PORT=3001 \
  REACT_APP_SHELL_ENV_MESSAGE=fromtheshell \
  NODE_PATH=src \
  nohup npm start &>$tmp_server_log &
grep -q 'You can now view' <(tail -f $tmp_server_log)

# Test "development" environment
E2E_URL="http://localhost:3001" \
  REACT_APP_SHELL_ENV_MESSAGE=fromtheshell \
  NODE_PATH=src \
  NODE_ENV=development \
  BABEL_ENV=test \
  node_modules/.bin/jest --no-cache --runInBand --config='jest.integration.config.js'

# Test "production" environment
E2E_FILE=./build/index.html \
  NODE_PATH=src \
  NODE_ENV=production \
  BABEL_ENV=test \
  PUBLIC_URL=http://www.example.org/spa/ \
  node_modules/.bin/jest --no-cache --runInBand --config='jest.integration.config.js'

# Cleanup
cleanup
