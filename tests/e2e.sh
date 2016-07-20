# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the BSD-style license found in the
# LICENSE file in the root directory of this source tree. An additional grant
# of patent rights can be found in the PATENTS file in the same directory.

# Start in tests/ even if run from root directory
cd "$(dirname "$0")"

# Exit the script on any command with non 0 return code
# We assume that all the commands in the pipeline set their return code
# properly and that we do not need to validate that the output is correct
set -e

# Echo every command being executed
set -x

# npm pack the two directories to make sure they are valid npm modules
initial_path=$PWD
cd ..
npm install
scripts_path=$PWD/`npm pack`
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
test -e build/*.html || exit 1
test -e build/*.js || exit 1

# Test the server
npm start -- --smoke-test

# Eject and test the build
echo yes | npm run eject
npm run build

# Check for expected output
test -e build/*.html || exit 1
test -e build/*.js || exit 1

# Test the server
npm start -- --smoke-test

# Cleanup
cd $initial_path
rm -rf $temp_cli_path $temp_app_path
