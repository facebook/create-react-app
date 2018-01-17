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

if hash npm 2>/dev/null
then
  npm i -g npm@latest
  npm cache clean || npm cache verify
fi

# Bootstrap create-react-app monorepo
yarn

# Start local registry
tmp_registry_log=`mktemp`
nohup npx verdaccio@2.7.2 &>$tmp_registry_log &
# Wait for `verdaccio` to boot
grep -q 'http address' <(tail -f $tmp_registry_log)

# Set registry to local registry
npm set registry "$custom_registry_url"
yarn config set registry "$custom_registry_url"

git clean -df
./tasks/publish.sh --yes --force-publish=* --skip-git --cd-version=prerelease --exact --npm-tag=latest --registry $custom_registry_url

# ******************************************************************************
# Set up the apps monorepo
# ******************************************************************************
# Start with base workspace
cp -r "$root_path/packages/react-scripts/fixtures/yarn-ws/ws" "$temp_app_path"

# Install cra-app1
# npx create-react-app --internal-testing-template="$root_path"/packages/react-scripts/fixtures/yarn-ws/cra-app1 cra-app1
# -- above needs https://github.com/facebookincubator/create-react-app/pull/3435 to user create-react-app
# -- alternative install until 3435
pushd "$temp_app_path/ws/packages"
cp -r "$root_path/packages/react-scripts/fixtures/yarn-ws/cra-app1" .
cd cra-app1
yarn add react-scripts
popd

# Bootstrap the apps monorepo
pushd "$temp_app_path/ws"
yarn
cd "packages/cra-app1"
# ******************************************************************************
# Test CRA-App1
# ******************************************************************************
yarn start --smoke-test
CI=true yarn test --watch=no
yarn build
popd

# ******************************************************************************
# Test eject
# ******************************************************************************
pushd "$temp_app_path/ws/packages/cra-app1"
# TODO: make eject work
# yarn run eject
# yarn start --smoke-test
# CI=true yarn test --watch=no
# yarn build
popd

# Cleanup
cleanup
