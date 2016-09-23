#!/bin/bash
# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the BSD-style license found in the
# LICENSE file in the root directory of this source tree. An additional grant
# of patent rights can be found in the PATENTS file in the same directory.

# ******************************************************************************
# This creates an app with the global CLI and `react-scripts` from the source.
# It is useful for testing the end-to-end flow locally.
# ******************************************************************************

# Start in tasks/ even if run from root directory
cd "$(dirname "$0")"

function cleanup {
  echo 'Cleaning up.'
  cd $root_path
  # Uncomment when snapshot testing is enabled by default:
  # rm ./template/src/__snapshots__/App.test.js.snap
  rm -rf $clean_path
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

# ******************************************************************************
# Pack react-scripts so we can verify they work.
# ******************************************************************************

# Packing react-scripts takes some work because we want to clean it up first.
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
# Now that we have packed them, call the global CLI.
# ******************************************************************************

# Go back to the root directory and run the command from here
cd $root_path
node packages/create-react-app/index.js --scripts-version=$scripts_path "$@"

# Cleanup
cleanup
