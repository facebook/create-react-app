#!/bin/bash
# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the BSD-style license found in the
# LICENSE file in the root directory of this source tree. An additional grant
# of patent rights can be found in the PATENTS file in the same directory.

# ******************************************************************************
# This is an end-to-end kitchensink test intended to run on CI.
# You can also run it locally but it's slow.
# ******************************************************************************

# Start in tasks/ even if run from root directory
cd "$(dirname "$0")"

# CLI, app, and test module temporary locations
# http://unix.stackexchange.com/a/84980
temp_cli_path=`mktemp -d 2>/dev/null || mktemp -d -t 'temp_cli_path'`
temp_app_path=`mktemp -d 2>/dev/null || mktemp -d -t 'temp_app_path'`
temp_module_path=`mktemp -d 2>/dev/null || mktemp -d -t 'temp_module_path'`

function cleanup {
  echo 'Cleaning up.'
  ps -ef | grep 'react-scripts' | grep -v grep | awk '{print $2}' | xargs kill -s 9
  cd "$root_path"
  # TODO: fix "Device or resource busy" and remove ``|| $CI`
  rm -rf "$temp_cli_path" "$temp_app_path" "$temp_module_path" || $CI
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

function create_react_app {
  node "$temp_cli_path"/node_modules/create-react-app/index.js "$@"
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

# Prevent lerna bootstrap, we only want top-level dependencies
cp package.json package.json.bak
grep -v "lerna bootstrap" package.json > temp && mv temp package.json
npm install
mv package.json.bak package.json

if [ "$USE_YARN" = "yes" ]
then
  # Install Yarn so that the test can use it to install packages.
  npm install -g yarn
  yarn cache clean
fi

# We removed the postinstall, so do it manually
./node_modules/.bin/lerna bootstrap --concurrency=1

cd packages/react-error-overlay/
npm run build:prod
cd ../..

# ******************************************************************************
# First, pack react-scripts and create-react-app so we can use them.
# ******************************************************************************

# Pack CLI
cd "$root_path"/packages/create-react-app
cli_path=$PWD/`npm pack`

# Go to react-scripts
cd "$root_path"/packages/react-scripts

# Save package.json because we're going to touch it
cp package.json package.json.orig

# Replace own dependencies (those in the `packages` dir) with the local paths
# of those packages.
node "$root_path"/tasks/replace-own-deps.js

# Finally, pack react-scripts
scripts_path="$root_path"/packages/react-scripts/`npm pack`

# Restore package.json
rm package.json
mv package.json.orig package.json

# ******************************************************************************
# Now that we have packed them, create a clean app folder and install them.
# ******************************************************************************

# Install the CLI in a temporary location
cd "$temp_cli_path"
npm install "$cli_path"

# Install the app in a temporary location
cd $temp_app_path
create_react_app --scripts-version="$scripts_path" --internal-testing-template="$root_path"/packages/react-scripts/fixtures/kitchensink test-kitchensink

# Install the test module
cd "$temp_module_path"
npm install test-integrity@^2.0.1

# ******************************************************************************
# Now that we used create-react-app to create an app depending on react-scripts,
# let's make sure all npm scripts are in the working state.
# ******************************************************************************

# Enter the app directory
cd "$temp_app_path/test-kitchensink"

# Link to our preset
npm link "$root_path"/packages/babel-preset-react-app

# Link to test module
npm link "$temp_module_path/node_modules/test-integrity"

# Test the build
REACT_APP_SHELL_ENV_MESSAGE=fromtheshell \
  NODE_PATH=src \
  PUBLIC_URL=http://www.example.org/spa/ \
  npm run build

# Check for expected output
exists build/*.html
exists build/static/js/main.*.js

# Unit tests
REACT_APP_SHELL_ENV_MESSAGE=fromtheshell \
  CI=true \
  NODE_PATH=src \
  NODE_ENV=test \
  npm test -- --no-cache --testPathPattern="/src/"

# Catch when no tests are detected
testsList=$(REACT_APP_SHELL_ENV_MESSAGE=fromtheshell \
  CI=true \
  NODE_PATH=src \
  npm test -- --no-cache --testPathPattern="/src/" --listTests)

if [[ ${testsList} =~ "[]" ]]; then
  exit 1
fi

# Test "development" environment
tmp_server_log=`mktemp`
PORT=3001 \
  REACT_APP_SHELL_ENV_MESSAGE=fromtheshell \
  NODE_PATH=src \
  nohup npm start &>$tmp_server_log &
while true
do
  if grep -q 'You can now view' $tmp_server_log; then
    break
  else
    sleep 1
  fi
done
E2E_URL="http://localhost:3001" \
  REACT_APP_SHELL_ENV_MESSAGE=fromtheshell \
  CI=true NODE_PATH=src \
  NODE_ENV=development \
  node_modules/.bin/mocha --require babel-register --require babel-polyfill integration/*.test.js

# Test "production" environment
E2E_FILE=./build/index.html \
  CI=true \
  NODE_PATH=src \
  NODE_ENV=production \
  PUBLIC_URL=http://www.example.org/spa/ \
  node_modules/.bin/mocha --require babel-register --require babel-polyfill integration/*.test.js

# ******************************************************************************
# Finally, let's check that everything still works after ejecting.
# ******************************************************************************

# Unlink our preset
npm unlink "$root_path"/packages/babel-preset-react-app

# Eject...
echo yes | npm run eject

# ...but still link to the local packages
npm link "$root_path"/packages/babel-preset-react-app
npm link "$root_path"/packages/eslint-config-react-app
npm link "$root_path"/packages/react-dev-utils
npm link "$root_path"/packages/react-scripts

# Link to test module
npm link "$temp_module_path/node_modules/test-integrity"

# Test the build
REACT_APP_SHELL_ENV_MESSAGE=fromtheshell \
  NODE_PATH=src \
  PUBLIC_URL=http://www.example.org/spa/ \
  npm run build

# Check for expected output
exists build/*.html
exists build/static/js/main.*.js

# Unit tests
REACT_APP_SHELL_ENV_MESSAGE=fromtheshell \
  CI=true \
  NODE_PATH=src \
  NODE_ENV=test \
  npm test -- --no-cache --testPathPattern='/src/'

# Test "development" environment
tmp_server_log=`mktemp`
PORT=3002 \
  REACT_APP_SHELL_ENV_MESSAGE=fromtheshell \
  NODE_PATH=src \
  nohup npm start &>$tmp_server_log &
while true
do
  if grep -q 'You can now view' $tmp_server_log; then
    break
  else
    sleep 1
  fi
done
E2E_URL="http://localhost:3002" \
  REACT_APP_SHELL_ENV_MESSAGE=fromtheshell \
  CI=true NODE_PATH=src \
  NODE_ENV=development \
  node_modules/.bin/mocha --require babel-register --require babel-polyfill integration/*.test.js

# Test "production" environment
E2E_FILE=./build/index.html \
  CI=true \
  NODE_ENV=production \
  NODE_PATH=src \
  PUBLIC_URL=http://www.example.org/spa/ \
  node_modules/.bin/mocha --require babel-register --require babel-polyfill integration/*.test.js

# Cleanup
cleanup
