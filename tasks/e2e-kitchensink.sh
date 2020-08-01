#!/bin/bash
# Copyright (c) 2015-present, Facebook, Inc.
#
# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.

# ******************************************************************************
# This is an end-to-end kitchensink test intended to run on CI.
# You can also run it locally but it's slow.
# ******************************************************************************

# Start in tasks/ even if run from root directory
cd "$(dirname "$0")"

# CLI, app, and test module temporary locations
# http://unix.stackexchange.com/a/84980
temp_app_path=`mktemp -d 2>/dev/null || mktemp -d -t 'temp_app_path'`
temp_module_path=`mktemp -d 2>/dev/null || mktemp -d -t 'temp_module_path'`

# Load functions for working with local NPM registry (Verdaccio)
source local-registry.sh

function cleanup {
  echo 'Cleaning up.'
  unset BROWSERSLIST
  ps -ef | grep 'react-scripts' | grep -v grep | awk '{print $2}' | xargs kill -9
  cd "$root_path"
  # TODO: fix "Device or resource busy" and remove ``|| $CI`
  rm -rf "$temp_app_path" "$temp_module_path" || $CI
  # Restore the original NPM and Yarn registry URLs and stop Verdaccio
  stopLocalRegistry
}

# Error messages are redirected to stderr
function handle_error {
  echo "$(basename $0): ERROR! An error was encountered executing line $1." 1>&2;
  cleanup
  echo 'Exiting with error.' 1>&2;
  exit 1
}

function handle_exit {
  cleanup
  echo 'Exiting without error.' 1>&2;
  exit
}

# Check for the existence of one or more files.
function exists {
  for f in $*; do
    test -e "$f"
  done
}

# Exit the script with a helpful error message when any error is encountered
trap 'set +x; handle_error $LINENO $BASH_COMMAND' ERR

# Cleanup before exit on any termination signal
trap 'set +x; handle_exit' SIGQUIT SIGTERM SIGINT SIGKILL SIGHUP

# Echo every command being executed
set -x

# Go to root
cd ..
root_path=$PWD
# Set a Windows path for GitBash on Windows
if [ "$AGENT_OS" == 'Windows_NT' ]; then
  root_path=$(cmd //c cd)
fi

if hash npm 2>/dev/null
then
  npm i -g npm@latest
fi

# Bootstrap monorepo
yarn

# ******************************************************************************
# First, publish the monorepo.
# ******************************************************************************

# Start the local NPM registry
startLocalRegistry "$root_path"/tasks/verdaccio.yaml

# Publish the monorepo
publishToLocalRegistry

# ******************************************************************************
# Now that we have published them, create a clean app folder and install them.
# ******************************************************************************

# Install the app in a temporary location
cd $temp_app_path
npx create-react-app test-kitchensink --template=file:"$root_path"/packages/react-scripts/fixtures/kitchensink

# Install the test module
cd "$temp_module_path"
yarn add test-integrity@^2.0.1

# ******************************************************************************
# Now that we used create-react-app to create an app depending on react-scripts,
# let's make sure all npm scripts are in the working state.
# ******************************************************************************

# Enter the app directory
cd "$temp_app_path/test-kitchensink"

# In kitchensink, we want to test all transforms
export BROWSERSLIST='ie 9'

# Link to test module
npm link "$temp_module_path/node_modules/test-integrity"

# Test the build
REACT_APP_SHELL_ENV_MESSAGE=fromtheshell \
  PUBLIC_URL=http://www.example.org/spa/ \
  yarn build

# Check for expected output
exists build/*.html
exists build/static/js/main.*.js

# Unit tests
# https://facebook.github.io/jest/docs/en/troubleshooting.html#tests-are-extremely-slow-on-docker-and-or-continuous-integration-ci-server
REACT_APP_SHELL_ENV_MESSAGE=fromtheshell \
  CI=true \
  NODE_ENV=test \
  yarn test --no-cache --runInBand --testPathPattern=src

# Prepare "development" environment
tmp_server_log=`mktemp`
PORT=3001 \
  REACT_APP_SHELL_ENV_MESSAGE=fromtheshell \
  NODE_PATH=src \
  nohup yarn start &>$tmp_server_log &
grep -q 'You can now view' <(tail -f $tmp_server_log)

# Test "development" environment
E2E_URL="http://localhost:3001" \
  REACT_APP_SHELL_ENV_MESSAGE=fromtheshell \
  CI=true NODE_PATH=src \
  NODE_ENV=development \
  BABEL_ENV=test \
  node_modules/.bin/jest --no-cache --runInBand --config='jest.integration.config.js'
# Test "production" environment
E2E_FILE=./build/index.html \
  CI=true \
  NODE_PATH=src \
  NODE_ENV=production \
  BABEL_ENV=test \
  PUBLIC_URL=http://www.example.org/spa/ \
  node_modules/.bin/jest --no-cache --runInBand --config='jest.integration.config.js'

# Cleanup
cleanup
