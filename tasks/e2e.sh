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

function cleanup {
  echo 'Cleaning up.'
  cd $root_path
  # Uncomment when snapshot testing is enabled by default:
  # rm ./packages/react-scripts/template/src/__snapshots__/App.test.js.snap
  rm -rf $temp_cli_path $temp_app_path $clean_path
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
cd $root_path/packages/create-react-app
cli_path=$PWD/`npm pack`

# Packing react-scripts takes more work because we want to clean it up first.
# Create a temporary clean folder that contains production only code.
# Do not overwrite any files in the current folder.
clean_path=`mktemp -d 2>/dev/null || mktemp -d -t 'clean_path'`

# Copy some of the react-scripts project files to the temporary folder.
# Exclude folders that definitely won’t be part of the package from processing.
# We will strip the dev-only code there, `npm pack`, and copy the package back.
cd $root_path
rsync -av --exclude='.git' --exclude=$clean_path\
  --exclude='node_modules' --exclude='build'\
  './' $clean_path  >/dev/null

# Open the clean folder
cd $clean_path/packages/react-scripts

# Now remove all the code relevant to development of Create React App.
files="$(find -L . -name "*.js" -type f)"
for file in $files; do
  sed -i.bak '/\/\/ @remove-on-publish-begin/,/\/\/ @remove-on-publish-end/d' $file
  rm $file.bak
done

# Install all our packages
cd $clean_path
$root_path/node_modules/.bin/lerna bootstrap

cd $clean_path/packages/react-scripts

# Like bundle-deps, this script modifies packages/react-scripts/package.json,
# copying own dependencies (those in the `packages` dir) to bundledDependencies
node $clean_path/tasks/bundle-own-deps.js

# Finally, pack react-scripts
scripts_path=$clean_path/packages/react-scripts/`npm pack`

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
create_react_app --scripts-version=$scripts_path test-app

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

# Cleanup
cleanup
