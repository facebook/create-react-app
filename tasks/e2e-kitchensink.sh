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
temp_cli_path=`mktemp -d 2>/dev/null || mktemp -d -t 'temp_cli_path'`
temp_app_path=`mktemp -d 2>/dev/null || mktemp -d -t 'temp_app_path'`
temp_module_path=`mktemp -d 2>/dev/null || mktemp -d -t 'temp_module_path'`

function cleanup {
  echo 'Cleaning up.'
  ps -ef | grep 'react-scripts' | grep -v grep | awk '{print $2}' | xargs kill -9
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

function install_package {
  local pkg=$(basename $1)

  # Clean target (for safety)
  rm -rf node_modules/$pkg/
  rm -rf node_modules/**/$pkg/

  # Copy package into node_modules/ ignoring installed deps
  # rsync -a ${1%/} node_modules/ --exclude node_modules
  cp -R ${1%/} node_modules/
  rm -rf node_modules/$pkg/node_modules/

  # Install `dependencies`
  cd node_modules/$pkg/
  npm install --only=production
  # Remove our packages to ensure side-by-side versions are used (which we link)
  rm -rf node_modules/{babel-preset-react-app,eslint-config-react-app,react-dev-utils,react-error-overlay,react-scripts}
  cd ../..
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

# Clear cache to avoid issues with incorrect packages being used
if hash yarnpkg 2>/dev/null
then
  # AppVeyor uses an old version of yarn.
  # Once updated to 0.24.3 or above, the workaround can be removed
  # and replaced with `yarnpkg cache clean`
  # Issues:
  #    https://github.com/yarnpkg/yarn/issues/2591
  #    https://github.com/appveyor/ci/issues/1576
  #    https://github.com/facebookincubator/create-react-app/pull/2400
  # When removing workaround, you may run into
  #    https://github.com/facebookincubator/create-react-app/issues/2030
  case "$(uname -s)" in
    *CYGWIN*|MSYS*|MINGW*) yarn=yarn.cmd;;
    *) yarn=yarnpkg;;
  esac
  $yarn cache clean
fi

if hash npm 2>/dev/null
then
  npm i -g npm@latest
  npm cache clean || npm cache verify
fi

# Prevent bootstrap, we only want top-level dependencies
cp package.json package.json.bak
grep -v "postinstall" package.json > temp && mv temp package.json
npm install
mv package.json.bak package.json

# We removed the postinstall, so do it manually
node bootstrap.js

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
install_package "$root_path"/packages/babel-preset-react-app
# Link to error overlay package because now it's a dependency
# of react-dev-utils and not react-scripts
install_package "$root_path"/packages/react-error-overlay

# Link to test module
install_package "$temp_module_path/node_modules/test-integrity"

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
  npm test -- --no-cache --testPathPattern=src

# Test "development" environment
tmp_server_log=`mktemp`
PORT=3001 \
  REACT_APP_SHELL_ENV_MESSAGE=fromtheshell \
  NODE_PATH=src \
  nohup npm start &>$tmp_server_log &
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
echo yes | npm run eject

# Ensure Yarn is ran after eject; at the time of this commit, we don't run Yarn
# after ejecting. Soon, we may only skip Yarn on Windows. Let's try to remove
# this in the near future.
if hash yarnpkg 2>/dev/null
then
  yarn install --check-files
fi

# ...but still link to the local packages
install_package "$root_path"/packages/babel-preset-react-app
install_package "$root_path"/packages/eslint-config-react-app
install_package "$root_path"/packages/react-error-overlay
install_package "$root_path"/packages/react-dev-utils

# Link to test module
install_package "$temp_module_path/node_modules/test-integrity"

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
  npm test -- --no-cache --testPathPattern=src

# Test "development" environment
tmp_server_log=`mktemp`
PORT=3002 \
  REACT_APP_SHELL_ENV_MESSAGE=fromtheshell \
  NODE_PATH=src \
  nohup npm start &>$tmp_server_log &
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
