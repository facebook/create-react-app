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

# App temporary location
# http://unix.stackexchange.com/a/84980
temp_app_path=`mktemp -d 2>/dev/null || mktemp -d -t 'temp_app_path'`
custom_registry_url=http://localhost:4873
original_npm_registry_url=`npm get registry`
original_yarn_registry_url=`yarn config get registry`

function cleanup {
  echo 'Cleaning up.'
  ps -ef | grep 'verdaccio' | grep -v grep | awk '{print $2}' | xargs kill -9
  cd "$root_path"
  # Uncomment when snapshot testing is enabled by default:
  # rm ./packages/react-scripts/template/src/__snapshots__/App.test.js.snap
  rm -rf "$temp_app_path"
  npm set registry "$original_npm_registry_url"
  yarn config set registry "$original_yarn_registry_url"
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

if hash npm 2>/dev/null
then
  npm i -g npm@latest
fi

# Bootstrap monorepo
yarn

# Start local registry
tmp_registry_log=`mktemp`
(cd && nohup npx verdaccio@3.8.2 -c "$root_path"/tasks/verdaccio.yaml &>$tmp_registry_log &)
# Wait for `verdaccio` to boot
grep -q 'http address' <(tail -f $tmp_registry_log)

# Set registry to local registry
npm set registry "$custom_registry_url"
yarn config set registry "$custom_registry_url"

# Login so we can publish packages
(cd && npx npm-auth-to-token@1.0.0 -u user -p password -e user@example.com -r "$custom_registry_url")

# Lint own code
./node_modules/.bin/eslint --max-warnings 0 packages/babel-preset-react-app/
./node_modules/.bin/eslint --max-warnings 0 packages/confusing-browser-globals/
./node_modules/.bin/eslint --max-warnings 0 packages/create-react-app/
./node_modules/.bin/eslint --max-warnings 0 packages/eslint-config-react-app/
./node_modules/.bin/eslint --max-warnings 0 packages/react-dev-utils/
./node_modules/.bin/eslint --max-warnings 0 packages/react-scripts/

cd packages/react-error-overlay/
./node_modules/.bin/eslint --max-warnings 0 src/
yarn test
if [ $APPVEYOR != 'True' ]; then
  # Flow started hanging on AppVeyor after we moved to Yarn Workspaces :-(
  yarn flow
fi
cd ../..

cd packages/react-dev-utils/
yarn test
cd ../..

cd packages/babel-plugin-named-asset-import/
yarn test
cd ../..

cd packages/confusing-browser-globals/
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

git clean -df
./tasks/publish.sh --yes --force-publish=* --skip-git --cd-version=prerelease --exact --npm-tag=latest

# ******************************************************************************
# Install react-scripts prerelease via create-react-app prerelease.
# ******************************************************************************

# Install the app in a temporary location
cd $temp_app_path
npx create-react-app test-app

# TODO: verify we installed prerelease

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

  rm sample.json

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

# Test ejected files were staged
test -n "$(git diff --staged --name-only)"

# Test the build
yarn build
# Check for expected output
exists build/*.html
exists build/static/js/*.js
exists build/static/css/*.css
exists build/static/media/*.svg
exists build/favicon.ico

# Run tests, overriding the watch option to disable it.
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
