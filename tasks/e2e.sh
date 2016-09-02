#!/bin/bash
# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the BSD-style license found in the
# LICENSE file in the root directory of this source tree. An additional grant
# of patent rights can be found in the PATENTS file in the same directory.

# Start in tests/ even if run from root directory
cd "$(dirname "$0")"

function cleanup {
  echo 'Cleaning up.'
  cd $initial_path
  # Uncomment when snapshot testing is enabled by default:
  # rm ../template/src/__snapshots__/App.test.js.snap
  rm -rf $temp_cli_path $temp_app_path
}

# error messages are redirected to stderr
function handle_error {
  echo "$(basename $0): \033[31mERROR!\033[m An error was encountered executing \033[36mline $1\033[m." 1>&2;
  cleanup
  echo 'Exiting with error.' 1>&2;
  exit 1
}

function handle_exit {
  cleanup
  echo 'Exiting without error.' 1>&2;
  exit
}

# Exit the script with a helpful error message when any error is encountered
trap 'set +x; handle_error $LINENO $BASH_COMMAND' ERR

# Cleanup before exit on any termination signal
trap 'set +x; handle_exit' SIGQUIT SIGTERM SIGINT SIGKILL SIGHUP

# Echo every command being executed
set -x

# `tasks/clean_pack.sh` the two directories to make sure they are valid npm modules
initial_path=$PWD

cd ..

# A hacky way to avoid bundling dependencies.
# Packing with them enabled takes too much memory, and Travis crashes.
# End to end script is meant to run on Travis so it's not a big deal.
# If you run it locally, you'll need to `git checkout -- package.json`.
perl -i -p0e 's/bundledDependencies.*?]/bundledDependencies": []/s' package.json

# Pack react-scripts
npm install
scripts_path=$PWD/`tasks/clean_pack.sh`

# Lint
./node_modules/.bin/eslint --ignore-path .gitignore ./

# Test local build command
npm run build

# Check for expected output
test -e build/*.html
test -e build/static/js/*.js
test -e build/static/css/*.css
test -e build/static/media/*.svg
test -e build/favicon.ico

# Run tests with CI flag
CI=true npm test
# Uncomment when snapshot testing is enabled by default:
# test -e template/src/__snapshots__/App.test.js.snap

# Test local start command
npm start -- --smoke-test

# Pack CLI
cd global-cli
npm install
cli_path=$PWD/`npm pack`

# Install the cli in a temporary location ( http://unix.stackexchange.com/a/84980 )
temp_cli_path=`mktemp -d 2>/dev/null || mktemp -d -t 'temp_cli_path'`
cd $temp_cli_path
npm install $cli_path

# Install the app in a temporary location
temp_app_path=`mktemp -d 2>/dev/null || mktemp -d -t 'temp_app_path'`
cd $temp_app_path
node "$temp_cli_path"/node_modules/create-react-app/index.js --scripts-version=$scripts_path test-app
cd test-app

# Test the build
npm run build

# Check for expected output
test -e build/*.html
test -e build/static/js/*.js
test -e build/static/css/*.css
test -e build/static/media/*.svg
test -e build/favicon.ico

# Run tests with CI flag
CI=true npm test
# Uncomment when snapshot testing is enabled by default:
# test -e src/__snapshots__/App.test.js.snap

# Test the server
npm start -- --smoke-test

# Eject and test the build
echo yes | npm run eject
npm run build

# Check for expected output
test -e build/*.html
test -e build/static/js/*.js
test -e build/static/css/*.css
test -e build/static/media/*.svg
test -e build/favicon.ico

# Run tests, overring the watch option to disable it
# TODO: make CI flag respected after ejecting as well
npm test -- --watch=no
# Uncomment when snapshot testing is enabled by default:
# test -e src/__snapshots__/App.test.js.snap

# Test the server
npm start -- --smoke-test

# Cleanup
cleanup
