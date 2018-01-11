#!/bin/bash
# Copyright (c) 2015-present, Facebook, Inc.
#
# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.

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
  cd "$root_path"
  # Uncomment when snapshot testing is enabled by default:
  # rm ./packages/react-scripts/template/src/__snapshots__/App.test.js.snap
  rm -rf "$temp_cli_path" $temp_app_path
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
  yarn --production
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

# Make sure we don't introduce accidental references to PATENTS.
EXPECTED='packages/react-error-overlay/fixtures/bundle.mjs
packages/react-error-overlay/fixtures/bundle.mjs.map
packages/react-error-overlay/fixtures/bundle_u.mjs
packages/react-error-overlay/fixtures/bundle_u.mjs.map
tasks/e2e-simple.sh'
ACTUAL=$(git grep -l PATENTS)
if [ "$EXPECTED" != "$ACTUAL" ]; then
  echo "PATENTS crept into some new files?"
  diff -u <(echo "$EXPECTED") <(echo "$ACTUAL") || true
  exit 1
fi

# Prevent bootstrap, we only want top-level dependencies
cp package.json package.json.bak
grep -v "postinstall" package.json > temp && mv temp package.json
yarn
mv package.json.bak package.json

# We removed the postinstall, so do it manually here
node bootstrap.js

# Lint own code
./node_modules/.bin/eslint --max-warnings 0 packages/babel-preset-react-app/
./node_modules/.bin/eslint --max-warnings 0 packages/create-react-app/
./node_modules/.bin/eslint --max-warnings 0 packages/eslint-config-react-app/
./node_modules/.bin/eslint --max-warnings 0 packages/react-dev-utils/
./node_modules/.bin/eslint --max-warnings 0 packages/react-scripts/
cd packages/react-error-overlay/
./node_modules/.bin/eslint --max-warnings 0 src/
yarn test
yarn build:prod
cd ../..
cd packages/react-dev-utils/
yarn test
cd ../..

# ******************************************************************************
# First, test the create-react-app development environment.
# This does not affect our users but makes sure we can develop it.
# ******************************************************************************

# Test local build command
yarn build
# Check for expected output
exists build/*.html
exists build/static/js/*.js
exists build/static/css/*.css
exists build/static/media/*.svg
exists build/favicon.ico

# Run tests with CI flag
CI=true yarn test
# Uncomment when snapshot testing is enabled by default:
# exists template/src/__snapshots__/App.test.js.snap

# Test local start command
yarn start --smoke-test

# ******************************************************************************
# Next, pack react-scripts and create-react-app so we can verify they work.
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

# Initialize package.json before installing the CLI because npm will not install
# the CLI properly in the temporary location if it is missing.
yarn init --yes

# Now we can install the CLI from the local package.
yarn add "$cli_path"

# Install the app in a temporary location
cd $temp_app_path
create_react_app --scripts-version="$scripts_path" test-app

# ******************************************************************************
# Now that we used create-react-app to create an app depending on react-scripts,
# let's make sure all npm scripts are in the working state.
# ******************************************************************************

function verify_env_url {
  # Backup package.json because we're going to make it dirty
  cp package.json package.json.orig

  # Test default behavior
  grep -F -R --exclude=*.map "\"/static/" build/ -q; test $? -eq 0 || exit 1

  # Test relative path build
  awk -v n=2 -v s="  \"homepage\": \".\"," 'NR == n {print s} {print}' package.json > tmp && mv tmp package.json

  yarn build
  # Disabled until this can be tested
  # grep -F -R --exclude=*.map "../../static/" build/ -q; test $? -eq 0 || exit 1
  grep -F -R --exclude=*.map "\"./static/" build/ -q; test $? -eq 0 || exit 1
  grep -F -R --exclude=*.map "\"/static/" build/ -q; test $? -eq 1 || exit 1

  PUBLIC_URL="/anabsolute" yarn build
  grep -F -R --exclude=*.map "/anabsolute/static/" build/ -q; test $? -eq 0 || exit 1
  grep -F -R --exclude=*.map "\"/static/" build/ -q; test $? -eq 1 || exit 1

  # Test absolute path build
  sed "2s/.*/  \"homepage\": \"\/testingpath\",/" package.json > tmp && mv tmp package.json

  yarn build
  grep -F -R --exclude=*.map "/testingpath/static/" build/ -q; test $? -eq 0 || exit 1
  grep -F -R --exclude=*.map "\"/static/" build/ -q; test $? -eq 1 || exit 1

  PUBLIC_URL="https://www.example.net/overridetest" yarn build
  grep -F -R --exclude=*.map "https://www.example.net/overridetest/static/" build/ -q; test $? -eq 0 || exit 1
  grep -F -R --exclude=*.map "\"/static/" build/ -q; test $? -eq 1 || exit 1
  grep -F -R --exclude=*.map "testingpath/static" build/ -q; test $? -eq 1 || exit 1

  # Test absolute url build
  sed "2s/.*/  \"homepage\": \"https:\/\/www.example.net\/testingpath\",/" package.json > tmp && mv tmp package.json

  yarn build
  grep -F -R --exclude=*.map "/testingpath/static/" build/ -q; test $? -eq 0 || exit 1
  grep -F -R --exclude=*.map "\"/static/" build/ -q; test $? -eq 1 || exit 1

  PUBLIC_URL="https://www.example.net/overridetest" yarn build
  grep -F -R --exclude=*.map "https://www.example.net/overridetest/static/" build/ -q; test $? -eq 0 || exit 1
  grep -F -R --exclude=*.map "\"/static/" build/ -q; test $? -eq 1 || exit 1
  grep -F -R --exclude=*.map "testingpath/static" build/ -q; test $? -eq 1 || exit 1

  # Restore package.json
  rm package.json
  mv package.json.orig package.json
}

function verify_module_scope {
  # Create stub json file
  echo "{}" >> sample.json

  # Save App.js, we're going to modify it
  cp src/App.js src/App.js.bak

  # Add an out of scope import
  echo "import sampleJson from '../sample'" | cat - src/App.js > src/App.js.temp && mv src/App.js.temp src/App.js

  # Make sure the build fails
  yarn build; test $? -eq 1 || exit 1
  # TODO: check for error message

  # Restore App.js
  rm src/App.js
  mv src/App.js.bak src/App.js
}

# Enter the app directory
cd test-app

# Test the build
yarn build
# Check for expected output
exists build/*.html
exists build/static/js/*.js
exists build/static/css/*.css
exists build/static/media/*.svg
exists build/favicon.ico

# Run tests with CI flag
CI=true yarn test
# Uncomment when snapshot testing is enabled by default:
# exists src/__snapshots__/App.test.js.snap

# Test the server
yarn start --smoke-test

# Test environment handling
verify_env_url

# Test reliance on webpack internals
verify_module_scope

# ******************************************************************************
# Finally, let's check that everything still works after ejecting.
# ******************************************************************************

# Eject...
echo yes | npm run eject

# ...but still link to the local packages
install_package "$root_path"/packages/babel-preset-react-app
install_package "$root_path"/packages/eslint-config-react-app
install_package "$root_path"/packages/react-dev-utils

# Test the build
yarn build
# Check for expected output
exists build/*.html
exists build/static/js/*.js
exists build/static/css/*.css
exists build/static/media/*.svg
exists build/favicon.ico

# Run tests, overring the watch option to disable it.
# `CI=true yarn test` won't work here because `yarn test` becomes just `jest`.
# We should either teach Jest to respect CI env variable, or make
# `scripts/test.js` survive ejection (right now it doesn't).
yarn test --watch=no
# Uncomment when snapshot testing is enabled by default:
# exists src/__snapshots__/App.test.js.snap

# Test the server
yarn start --smoke-test

# Test environment handling
verify_env_url

# Test reliance on webpack internals
verify_module_scope

# Cleanup
cleanup
