#!/bin/bash
# Copyright (c) 2015-present, Facebook, Inc.
#
# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.

# ******************************************************************************
# Code shared among all E2E tests. Each one should source this as the first
# part of their individual test.
# ******************************************************************************

# Echo every command being executed
set -x

# Set current directory to the one this script lives in
# and establish a path to the root of the repo
cd "$(dirname "$0")"
root_path=$(readlink -f "../..") # change this if this file moves

# CLI, app, and test module temporary locations
# http://unix.stackexchange.com/a/84980
temp_app_path=`mktemp -d 2>/dev/null || mktemp -d -t 'temp_app_path'`
temp_module_path=`mktemp -d 2>/dev/null || mktemp -d -t 'temp_module_path'`

# functions for working with local NPM registry (Verdaccio)
custom_registry_url=http://localhost:4873
original_npm_registry_url=`npm get registry`
original_yarn_registry_url=`yarn config get registry`
default_verdaccio_package=verdaccio@^4.5.1

function startLocalRegistry {
  # Start local registry
  tmp_registry_log=`mktemp`
  echo "Registry output file: $tmp_registry_log"
  (cd && nohup npx ${VERDACCIO_PACKAGE:-$default_verdaccio_package} -c $1 &>$tmp_registry_log &)
  # Wait for Verdaccio to boot
  grep -q 'http address' <(tail -f $tmp_registry_log)

  # Set registry to local registry
  npm set registry "$custom_registry_url"
  yarn config set registry "$custom_registry_url"
}

function stopLocalRegistry {
  # Restore the original NPM and Yarn registry URLs and stop Verdaccio
  npm set registry "$original_npm_registry_url"
  yarn config set registry "$original_yarn_registry_url"
}

function publishToLocalRegistry {
  git clean -df
  ./tasks/publish.sh prerelease --yes --force-publish=* --no-git-tag-version --no-commit-hooks --no-push --exact --dist-tag=latest
}

function cleanup {
  echo 'Cleaning up.'
  unset BROWSERSLIST
  unset EJECT
  ps -ef | grep 'react-scripts' | grep -v grep | awk '{print $2}' | xargs kill -9
  cd "$root_path"
  # Uncomment when snapshot testing is enabled by default:
  # rm ./packages/react-scripts/template/src/__snapshots__/App.test.js.snap
  # TODO: fix "Device or resource busy" and remove ``|| $CI`
  rm -rf "$temp_app_path" "$temp_module_path" || $CI
  # Restore the original NPM and Yarn registry URLs and stop Verdaccio
  stopLocalRegistry
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

# Check for accidental dependencies in package.json
function checkDependencies {
  if ! awk '/"dependencies": {/{y=1;next}/},/{y=0; next}y' package.json | \
  grep -v -q -E '^\s*"(@testing-library\/.+)|web-vitals|(react(-dom|-scripts)?)"'; then
   echo "Dependencies are correct"
  else
   echo "There are extraneous dependencies in package.json"
   exit 1
  fi
}

# Check for accidental dependencies in package.json
function checkTypeScriptDependencies {
  if ! awk '/"dependencies": {/{y=1;next}/},/{y=0; next}y' package.json | \
  grep -v -q -E '^\s*"(@testing-library\/.+)|web-vitals|(@types\/.+)|typescript|(react(-dom|-scripts)?)"'; then
   echo "Dependencies are correct"
  else
   echo "There are extraneous dependencies in package.json"
   exit 1
  fi
}

# Exit the script with a helpful error message when any error is encountered
trap 'set +x; handle_error $LINENO $BASH_COMMAND' ERR

# Cleanup before exit on any termination signal
trap 'set +x; handle_exit' SIGQUIT SIGTERM SIGINT SIGKILL SIGHUP

# Go to root
cd $root_path

# Set a Windows path for GitBash on Windows
if [ "$AGENT_OS" == 'Windows_NT' ]; then
  root_path=$(cmd //c cd)
fi
