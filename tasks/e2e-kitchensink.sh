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

# CLI and app temporary locations
# http://unix.stackexchange.com/a/84980
temp_cli_path=`mktemp -d 2>/dev/null || mktemp -d -t 'temp_cli_path'`
temp_app_path=`mktemp -d 2>/dev/null || mktemp -d -t 'temp_app_path'`

function cleanup {
  echo 'Cleaning up.'
  cd $root_path
  # Uncomment when snapshot testing is enabled by default:
  # rm ./packages/react-scripts/template/src/__snapshots__/App.test.js.snap
  rm -rf $temp_cli_path $temp_app_path
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
  node "$temp_cli_path"/node_modules/create-react-app/index.js $*
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

npm install

# If the node version is < 4, the script should just give an error.
if [ `node --version | sed -e 's/^v//' -e 's/\..\+//g'` -lt 4 ]
then
  cd $temp_app_path
  err_output=`node "$root_path"/packages/create-react-app/index.js test-node-version 2>&1 > /dev/null || echo ''`
  [[ $err_output =~ You\ are\ running\ Node ]] && exit 0 || exit 1
fi

if [ "$USE_YARN" = "yes" ]
then
  # Install Yarn so that the test can use it to install packages.
  npm install -g yarn@0.17.10 # TODO: remove version when https://github.com/yarnpkg/yarn/issues/2142 is fixed.
  yarn cache clean
fi

# ******************************************************************************
# First, pack react-scripts and create-react-app so we can use them.
# ******************************************************************************

# Pack CLI
cd $root_path/packages/create-react-app
cli_path=$PWD/`npm pack`

# Go to react-scripts
cd $root_path/packages/react-scripts

# Save package.json because we're going to touch it
cp package.json package.json.orig

# Replace own dependencies (those in the `packages` dir) with the local paths
# of those packages.
node $root_path/tasks/replace-own-deps.js

# Remove .npmignore so the test template is added
rm $root_path/packages/react-scripts/.npmignore

# Finally, pack react-scripts
scripts_path=$root_path/packages/react-scripts/`npm pack`

# Restore package.json
rm package.json
mv package.json.orig package.json

# ******************************************************************************
# Now that we have packed them, create a clean app folder and install them.
# ******************************************************************************

# Install the CLI in a temporary location
cd $temp_cli_path
npm install $cli_path

# Install the app in a temporary location
cd $temp_app_path
create_react_app --scripts-version=$scripts_path --internal-testing-template=$root_path/packages/react-scripts/fixtures/kitchensink test-kitchensink

# ******************************************************************************
# Now that we used create-react-app to create an app depending on react-scripts,
# let's make sure all npm scripts are in the working state.
# ******************************************************************************

# Enter the app directory
cd test-kitchensink

# Test the build
NODE_PATH=src REACT_APP_SHELL_ENV_MESSAGE=fromtheshell npm run build
# Check for expected output
test -e build/*.html
test -e build/static/js/main.*.js

# Unit tests
REACT_APP_SHELL_ENV_MESSAGE=fromtheshell \
  CI=true \
  NODE_PATH=src \
  npm test -- --no-cache --testPathPattern="/src/"

# Test "development" environment
tmp_server_log=`mktemp`
PORT=3001 \
  REACT_APP_SHELL_ENV_MESSAGE=fromtheshell \
  NODE_PATH=src \
  nohup npm start &>$tmp_server_log &
grep -q 'The app is running at:' <(tail -f $tmp_server_log)
E2E_URL="http://localhost:3001" \
  REACT_APP_SHELL_ENV_MESSAGE=fromtheshell \
  CI=true NODE_PATH=src \
  node node_modules/.bin/mocha --require babel-register --require babel-polyfill integration/*.test.js

# Test "production" environment
E2E_FILE=./build/index.html \
  CI=true \
  NODE_PATH=src \
  node_modules/.bin/mocha --require babel-register --require babel-polyfill integration/*.js

# Uncomment when snapshot testing is enabled by default:
# test -e src/__snapshots__/App.test.js.snap

# Test the server
REACT_APP_SHELL_ENV_MESSAGE=fromtheshell NODE_PATH=src npm start -- --smoke-test
REACT_APP_SHELL_ENV_MESSAGE=fromtheshell HTTPS=true NODE_PATH=src npm start -- --smoke-test

# ******************************************************************************
# Finally, let's check that everything still works after ejecting.
# ******************************************************************************

# Eject...
echo yes | npm run eject

# ...but still link to the local packages
npm link $root_path/packages/babel-preset-react-app
npm link $root_path/packages/eslint-config-react-app
npm link $root_path/packages/react-dev-utils
npm link $root_path/packages/react-scripts

# ...and we need  to remove template's .babelrc
rm .babelrc

# Test the build
NODE_PATH=src REACT_APP_SHELL_ENV_MESSAGE=fromtheshell npm run build
# Check for expected output
test -e build/*.html
test -e build/static/js/main.*.js

# Unit tests
REACT_APP_SHELL_ENV_MESSAGE=fromtheshell \
  CI=true \
  NODE_PATH=src \
  npm test -- --no-cache --testPathPattern="/src/"

# Test "development" environment
tmp_server_log=`mktemp`
PORT=3002 \
  REACT_APP_SHELL_ENV_MESSAGE=fromtheshell \
  NODE_PATH=src \
  nohup npm start &>$tmp_server_log &
grep -q 'The app is running at:' <(tail -f $tmp_server_log)
E2E_URL="http://localhost:3002" \
  REACT_APP_SHELL_ENV_MESSAGE=fromtheshell \
  CI=true NODE_PATH=src \
  NODE_ENV=production \
  node_modules/.bin/mocha --require babel-register --require babel-polyfill integration/*.js

# Test "production" environment
E2E_FILE=./build/index.html \
  CI=true \
  NODE_ENV=production \
  NODE_PATH=src \
  node_modules/.bin/mocha --require babel-register --require babel-polyfill integration/*.js

# Uncomment when snapshot testing is enabled by default:
# test -e src/__snapshots__/App.test.js.snap

# Test the server
REACT_APP_SHELL_ENV_MESSAGE=fromtheshell NODE_PATH=src npm start -- --smoke-test

# Cleanup
cleanup
