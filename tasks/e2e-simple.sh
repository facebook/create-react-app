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
  npm cache clean
fi

# Prevent lerna bootstrap, we only want top-level dependencies
cp package.json package.json.bak
grep -v "lerna bootstrap" package.json > temp && mv temp package.json
npm install
mv package.json.bak package.json

# We need to install create-react-app deps to test it
cd "$root_path"/packages/create-react-app
npm install
cd "$root_path"

# If the node version is < 6, the script should just give an error.
nodeVersion=`node --version | cut -d v -f2`
nodeMajor=`echo $nodeVersion | cut -d. -f1`
nodeMinor=`echo $nodeVersion | cut -d. -f2`
if [[ nodeMajor -lt 6 ]]
then
  cd $temp_app_path
  err_output=`node "$root_path"/packages/create-react-app/index.js test-node-version 2>&1 > /dev/null || echo ''`
  [[ $err_output =~ You\ are\ running\ Node ]] && exit 0 || exit 1
fi

# We removed the postinstall, so do it manually here
./node_modules/.bin/lerna bootstrap --concurrency=1

if [ "$USE_YARN" = "yes" ]
then
  # Install Yarn so that the test can use it to install packages.
  npm install -g yarn
  yarn cache clean
fi

# Lint own code
npm run build:prod
cd ../..

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
npm init --yes

# Now we can install the CLI from the local package.
npm install "$cli_path"

# Install the app in a temporary location
cd $temp_app_path
create_react_app --scripts-version="$scripts_path" test-app


# ******************************************************************************
# Finally, let's check that everything still works after ejecting.
# ******************************************************************************

# Eject...
echo yes | npm run eject


# Cleanup
cleanup
