#!/bin/bash
# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the BSD-style license found in the
# LICENSE file in the root directory of this source tree. An additional grant
# of patent rights can be found in the PATENTS file in the same directory.

# ******************************************************************************
# This is an end-to-end test intended to run on CI.
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

if [ "$USE_YARN" = "yes" ]
then
  # Install Yarn so that the test can use it to install packages.
  npm install -g yarn@0.17.10 # TODO: remove version when https://github.com/yarnpkg/yarn/issues/2142 is fixed.
  yarn cache clean
fi

# ******************************************************************************
# First, pack and install create-react-app.
# ******************************************************************************

# Pack CLI
cd $root_path/packages/create-react-app
cli_path=$PWD/`npm pack`

# Install the CLI in a temporary location
cd $temp_cli_path
npm install $cli_path

# ******************************************************************************
# Test --scripts-version with a version number
# ******************************************************************************

cd $temp_app_path
create_react_app --scripts-version=0.4.0 test-app-version-number
cd test-app-version-number

# Check corresponding scripts version is installed.
test -e node_modules/react-scripts
grep '"version": "0.4.0"' node_modules/react-scripts/package.json

# ******************************************************************************
# Test --scripts-version with a tarball url
# ******************************************************************************

cd $temp_app_path
create_react_app --scripts-version=https://registry.npmjs.org/react-scripts/-/react-scripts-0.4.0.tgz test-app-tarball-url
cd test-app-tarball-url

# Check corresponding scripts version is installed.
test -e node_modules/react-scripts
grep '"version": "0.4.0"' node_modules/react-scripts/package.json

# ******************************************************************************
# Test --scripts-version with a custom fork of react-scripts
# ******************************************************************************

cd $temp_app_path
create_react_app --scripts-version=react-scripts-fork test-app-fork
cd test-app-fork

# Check corresponding scripts version is installed.
test -e node_modules/react-scripts-fork

# ******************************************************************************
# Test nested folder path as the project name
# ******************************************************************************

#Testing a path that exists
cd $temp_app_path
mkdir test-app-nested-paths-t1
cd test-app-nested-paths-t1
mkdir -p test-app-nested-paths-t1/aa/bb/cc/dd
create_react_app test-app-nested-paths-t1/aa/bb/cc/dd
cd test-app-nested-paths-t1/aa/bb/cc/dd
npm start -- --smoke-test

#Testing a path that does not exist
cd $temp_app_path
create_react_app test-app-nested-paths-t2/aa/bb/cc/dd
cd test-app-nested-paths-t2/aa/bb/cc/dd
npm start -- --smoke-test

#Testing a path that is half exists
cd $temp_app_path
mkdir -p test-app-nested-paths-t3/aa
create_react_app test-app-nested-paths-t3/aa/bb/cc/dd
cd test-app-nested-paths-t3/aa/bb/cc/dd
npm start -- --smoke-test

# Cleanup
cleanup
