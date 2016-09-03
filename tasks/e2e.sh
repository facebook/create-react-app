#!/bin/bash
# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the BSD-style license found in the
# LICENSE file in the root directory of this source tree. An additional grant
# of patent rights can be found in the PATENTS file in the same directory.

# Start in tasks/ even if run from root directory
cd "$(dirname "$0")"

function cleanup {
  echo 'Cleaning up.'
  cd $root_path
  # Uncomment when snapshot testing is enabled by default:
  # rm ./template/src/__snapshots__/App.test.js.snap
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

# Exit the script with a helpful error message when any error is encountered
trap 'set +x; handle_error $LINENO $BASH_COMMAND' ERR

# Cleanup before exit on any termination signal
trap 'set +x; handle_exit' SIGQUIT SIGTERM SIGINT SIGKILL SIGHUP

# Echo every command being executed
set -x

# Go to root
cd ..
root_path=$PWD

# Lint
./node_modules/.bin/eslint --ignore-path .gitignore ./

# ******************************************************************************
# First, test the create-react-app development environment.
# This does not affect our users but makes sure we can develop it.
# ******************************************************************************

npm install

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

# ******************************************************************************
# Next, pack react-scripts and create-react-app so we can verify they work.
# ******************************************************************************

# Pack CLI (it doesn't need cleaning)
cd global-cli
npm install
cli_path=$PWD/`npm pack`

# Packing react-scripts takes more work because we want to clean it up first.
# Create a temporary clean folder that contains production only code.
# Do not overwrite any files in the current folder.
clean_path=`mktemp -d 2>/dev/null || mktemp -d -t 'clean_path'`

# Copy some of the project files to the temporary folder.
# Exclude folders that definitely won’t be part of the package from processing.
# We will strip the dev-only code there, `npm pack`, and copy the package back.
cd $root_path
rsync -av --exclude='.git' --exclude=$clean_path\
  --exclude='node_modules' --exclude='build'\
  './' $clean_path  >/dev/null

# Open the clean folder
cd $clean_path
# Now remove all the code relevant to development of Create React App.
files="$(find -L . -name "*.js" -type f)"
for file in $files; do
  sed -i.bak '/\/\/ @remove-on-publish-begin/,/\/\/ @remove-on-publish-end/d' $file
  rm $file.bak
done

# A hacky way to avoid bundling dependencies.
# Packing with them enabled takes too much memory, and Travis crashes.
perl -i -p0e 's/bundledDependencies.*?]/bundledDependencies": []/s' package.json

# Finally, pack react-scripts
npm install
scripts_path=$clean_path/`npm pack`

# ******************************************************************************
# Now that we have packed them, create a clean app folder and install them.
# ******************************************************************************

# Install the CLI in a temporary location
# http://unix.stackexchange.com/a/84980
temp_cli_path=`mktemp -d 2>/dev/null || mktemp -d -t 'temp_cli_path'`
cd $temp_cli_path
npm install $cli_path

# Install the app in a temporary location
temp_app_path=`mktemp -d 2>/dev/null || mktemp -d -t 'temp_app_path'`
cd $temp_app_path
node "$temp_cli_path"/node_modules/create-react-app/index.js --scripts-version=$scripts_path test-app

# ******************************************************************************
# Now that we used create-react-app to create an app depending on react-scripts,
# let's make sure all npm scripts are in the working state.
# ******************************************************************************

# Enter the app directory
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

# ******************************************************************************
# Finally, let's check that everything still works after ejecting.
# ******************************************************************************

# Eject
echo yes | npm run eject

# Test the build
npm run build
# Check for expected output
test -e build/*.html
test -e build/static/js/*.js
test -e build/static/css/*.css
test -e build/static/media/*.svg
test -e build/favicon.ico

# Run tests, overring the watch option to disable it.
# `CI=true npm test` won't work here because `npm test` becomes just `jest`.
# We should either teach Jest to respect CI env variable, or make
# `scripts/test.js` survive ejection (right now it doesn't).
npm test -- --watch=no
# Uncomment when snapshot testing is enabled by default:
# test -e src/__snapshots__/App.test.js.snap

# Test the server
npm start -- --smoke-test

# Cleanup
cleanup
