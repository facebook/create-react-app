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

function cleanup {
  echo 'Cleaning up.'
  ps -ef | grep 'react-scripts' | grep -v grep | awk '{print $2}' | xargs kill -9
  cd "$root_path"
  # TODO: fix "Device or resource busy" and remove ``|| $CI`
  rm -rf "$temp_app_path" "$temp_module_path" || $CI
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

if hash npm 2>/dev/null
then
  npm i -g npm@latest
  npm cache clean || npm cache verify
fi

# Prevent bootstrap, we only want top-level dependencies
cp package.json package.json.bak
grep -v "postinstall" package.json > temp && mv temp package.json
yarn
mv package.json.bak package.json

# We removed the postinstall, so do it manually
node bootstrap.js

cd packages/react-error-overlay/
yarn build:prod
cd ../..

# ******************************************************************************
# First, publish the monorepo.
# ******************************************************************************

# Start local registry
tmp_registry_log=`mktemp`
nohup npx verdaccio@2.7.2 &>$tmp_registry_log &
# Wait for `verdaccio` to boot
grep -q 'http address' <(tail -f $tmp_registry_log)

# Set registry to local registry
npm set registry http://localhost:4873
yarn config set registry http://localhost:4873

# Login so we can publish packages
npx npm-cli-login@0.0.10 -u user -p password -e user@example.com -r http://localhost:4873 --quotes

# Publish the monorepo
git clean -f
./tasks/release.sh --yes --force-publish=* --skip-git --cd-version=prerelease --exact --npm-tag=latest

# ******************************************************************************
# Now that we have published them, create a clean app folder and install them.
# ******************************************************************************

# Install the app in a temporary location
cd $temp_app_path
npx create-react-app --internal-testing-template="$root_path"/packages/react-scripts/fixtures/kitchensink test-kitchensink

# Install the test module
cd "$temp_module_path"
yarn add test-integrity@^2.0.1

# ******************************************************************************
# Now that we used create-react-app to create an app depending on react-scripts,
# let's make sure all npm scripts are in the working state.
# ******************************************************************************

# Enter the app directory
cd "$temp_app_path/test-kitchensink"

# Link to test module
npm link "$temp_module_path/node_modules/test-integrity"

# Test the build
REACT_APP_SHELL_ENV_MESSAGE=fromtheshell \
  NODE_PATH=src \
  PUBLIC_URL=http://www.example.org/spa/ \
  yarn build

# Check for expected output
exists build/*.html
exists build/static/js/main.*.js

# Unit tests
REACT_APP_SHELL_ENV_MESSAGE=fromtheshell \
  CI=true \
  NODE_PATH=src \
  NODE_ENV=test \
  yarn test --no-cache --testPathPattern=src

# Test "development" environment
tmp_server_log=`mktemp`
PORT=3001 \
  REACT_APP_SHELL_ENV_MESSAGE=fromtheshell \
  NODE_PATH=src \
  nohup yarn start &>$tmp_server_log &
grep -q 'You can now view' <(tail -f $tmp_server_log)
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

# Eject...
echo yes | yarn eject

# Link to test module
npm link "$temp_module_path/node_modules/test-integrity"

# Test the build
REACT_APP_SHELL_ENV_MESSAGE=fromtheshell \
  NODE_PATH=src \
  PUBLIC_URL=http://www.example.org/spa/ \
  yarn build

# Check for expected output
exists build/*.html
exists build/static/js/main.*.js

# Unit tests
REACT_APP_SHELL_ENV_MESSAGE=fromtheshell \
  CI=true \
  NODE_PATH=src \
  NODE_ENV=test \
  yarn test --no-cache --testPathPattern=src

# Test "development" environment
tmp_server_log=`mktemp`
PORT=3002 \
  REACT_APP_SHELL_ENV_MESSAGE=fromtheshell \
  NODE_PATH=src \
  nohup yarn start &>$tmp_server_log &
grep -q 'You can now view' <(tail -f $tmp_server_log)
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
