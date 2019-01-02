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
custom_registry_url=http://localhost:4873
original_npm_registry_url=`npm get registry`
original_yarn_registry_url=`yarn config get registry`

function cleanup {
  echo 'Cleaning up.'
  ps -ef | grep 'react-scripts' | grep -v grep | awk '{print $2}' | xargs kill -9
  cd "$root_path"
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

if hash npm 2>/dev/null
then
  npm i -g npm@latest
fi

# Bootstrap monorepo
yarn

# ******************************************************************************
# First, publish the monorepo.
# ******************************************************************************

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

# Publish the monorepo
git clean -df
./tasks/publish.sh --yes --force-publish=* --skip-git --cd-version=prerelease --exact --npm-tag=latest

# ******************************************************************************
# Now that we have published them, run all tests as if they were released.
# ******************************************************************************

# Run all tests
cd test/
CI=true ../node_modules/.bin/jest -w 2

# Cleanup
cleanup
