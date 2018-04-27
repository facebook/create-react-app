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
temp_app_path=`mktemp -d 2>/dev/null || mktemp -d -t 'temp_app_path'`
custom_registry_url=http://localhost:4873
original_npm_registry_url=`npm get registry`
original_yarn_registry_url=`yarn config get registry`

function cleanup {
  echo 'Cleaning up.'
  cd "$root_path"
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

# Check for accidental dependencies in package.json
function checkDependencies {
  if ! awk '/"dependencies": {/{y=1;next}/},/{y=0; next}y' package.json | \
  grep -v -q -E '^\s*"react(-dom|-scripts)?"'; then
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

# Bootstrap monorepo
yarn

# ******************************************************************************
# First, publish the monorepo.
# ******************************************************************************

# Start local registry
tmp_registry_log=`mktemp`
nohup npx verdaccio@2.7.2 &>$tmp_registry_log &
# Wait for `verdaccio` to boot
grep -q 'http address' <(tail -f $tmp_registry_log)

# Set registry to local registry
npm set registry "$custom_registry_url"
yarn config set registry "$custom_registry_url"

# Login so we can publish packages
npx npm-cli-login@0.0.10 -u user -p password -e user@example.com -r "$custom_registry_url" --quotes

# Publish the monorepo
git clean -df
./tasks/publish.sh --yes --force-publish=* --skip-git --cd-version=prerelease --exact --npm-tag=latest

# ******************************************************************************
# Test --scripts-version with a version number
# ******************************************************************************

cd "$temp_app_path"
npx create-react-app --scripts-version=1.0.17 test-app-version-number
cd test-app-version-number

# Check corresponding scripts version is installed.
exists node_modules/react-scripts
grep '"version": "1.0.17"' node_modules/react-scripts/package.json
checkDependencies

# ******************************************************************************
# Test --use-npm flag
# ******************************************************************************

cd "$temp_app_path"
npx create-react-app --use-npm --scripts-version=1.0.17 test-use-npm-flag
cd test-use-npm-flag

# Check corresponding scripts version is installed.
exists node_modules/react-scripts
[ ! -e "yarn.lock" ] && echo "yarn.lock correctly does not exist"
grep '"version": "1.0.17"' node_modules/react-scripts/package.json
checkDependencies

# ******************************************************************************
# Test --scripts-version with a tarball url
# ******************************************************************************

cd "$temp_app_path"
npx create-react-app --scripts-version=https://registry.npmjs.org/react-scripts/-/react-scripts-1.0.17.tgz test-app-tarball-url
cd test-app-tarball-url

# Check corresponding scripts version is installed.
exists node_modules/react-scripts
grep '"version": "1.0.17"' node_modules/react-scripts/package.json
checkDependencies

# ******************************************************************************
# Test --scripts-version with a custom fork of react-scripts
# ******************************************************************************

cd "$temp_app_path"
npx create-react-app --scripts-version=react-scripts-fork test-app-fork
cd test-app-fork

# Check corresponding scripts version is installed.
exists node_modules/react-scripts-fork

# ******************************************************************************
# Test project folder is deleted on failing package installation
# ******************************************************************************

cd "$temp_app_path"
# we will install a non-existing package to simulate a failed installataion.
npx create-react-app --scripts-version=`date +%s` test-app-should-not-exist || true
# confirm that the project folder was deleted
test ! -d test-app-should-not-exist

# ******************************************************************************
# Test project folder is not deleted when creating app over existing folder
# ******************************************************************************

cd "$temp_app_path"
mkdir test-app-should-remain
echo '## Hello' > ./test-app-should-remain/README.md
# we will install a non-existing package to simulate a failed installataion.
npx create-react-app --scripts-version=`date +%s` test-app-should-remain || true
# confirm the file exist
test -e test-app-should-remain/README.md
# confirm only README.md is the only file in the directory
if [ "$(ls -1 ./test-app-should-remain | wc -l | tr -d '[:space:]')" != "1" ]; then
  false
fi

# ******************************************************************************
# Test --scripts-version with a scoped fork tgz of react-scripts
# ******************************************************************************

cd $temp_app_path
curl "https://registry.npmjs.org/@enoah_netzach/react-scripts/-/react-scripts-0.9.0.tgz" -o enoah-scripts-0.9.0.tgz
npx create-react-app --scripts-version=$temp_app_path/enoah-scripts-0.9.0.tgz test-app-scoped-fork-tgz
cd test-app-scoped-fork-tgz

# Check corresponding scripts version is installed.
exists node_modules/@enoah_netzach/react-scripts

# ******************************************************************************
# Test nested folder path as the project name
# ******************************************************************************

# Testing a path that exists
cd "$temp_app_path"
mkdir test-app-nested-paths-t1
cd test-app-nested-paths-t1
mkdir -p test-app-nested-paths-t1/aa/bb/cc/dd
npx create-react-app test-app-nested-paths-t1/aa/bb/cc/dd
cd test-app-nested-paths-t1/aa/bb/cc/dd
yarn start --smoke-test

# Testing a path that does not exist
cd "$temp_app_path"
npx create-react-app test-app-nested-paths-t2/aa/bb/cc/dd
cd test-app-nested-paths-t2/aa/bb/cc/dd
yarn start --smoke-test

# Testing a path that is half exists
cd "$temp_app_path"
mkdir -p test-app-nested-paths-t3/aa
npx create-react-app test-app-nested-paths-t3/aa/bb/cc/dd
cd test-app-nested-paths-t3/aa/bb/cc/dd
yarn start --smoke-test

# Cleanup
cleanup