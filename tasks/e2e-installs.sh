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

# Load functions for working with local NPM registry (Verdaccio)
source local-registry.sh

function cleanup {
  echo 'Cleaning up.'
  cd "$root_path"
  rm -rf "$temp_app_path"
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

# Start the local NPM registry
startLocalRegistry "$root_path"/tasks/verdaccio.yaml

# Publish the monorepo
publishToLocalRegistry

echo "Create React App Version: "
npx create-react-app --version

# ******************************************************************************
# Test --scripts-version with a distribution tag
# ******************************************************************************

cd "$temp_app_path"
npx create-react-app test-app-dist-tag --scripts-version=@skyscanner/backpack-react-scripts --template @skyscanner/backpack
cd test-app-dist-tag

# Check corresponding scripts version is installed and no TypeScript is present.
exists node_modules/@skyscanner/backpack-react-scripts
! exists node_modules/typescript
! exists src/index.tsx
exists src/index.js
checkDependencies

# ******************************************************************************
# Test --scripts-version with a version number
# ******************************************************************************

cd "$temp_app_path"
npx create-react-app test-app-version-number --scripts-version=backpack-react-scripts@8.0.0-beta.41a3a687f --template @skyscanner/backpack
cd test-app-version-number

# Check corresponding scripts version is installed.
exists node_modules/backpack-react-scripts
grep '"version": "8.0.0-beta.41a3a687f"' node_modules/backpack-react-scripts/package.json
checkDependencies

# ******************************************************************************
# Test --use-npm flag
# ******************************************************************************

cd "$temp_app_path"
npx create-react-app test-use-npm-flag --use-npm --scripts-version=@skyscanner/backpack-react-scripts@9.1.0 --template @skyscanner/backpack
cd test-use-npm-flag

# Check corresponding scripts version is installed.
exists node_modules/@skyscanner/backpack-react-scripts
[ ! -e "yarn.lock" ] && echo "yarn.lock correctly does not exist"
grep '"version": "9.1.0"' node_modules/@skyscanner/backpack-react-scripts/package.json
checkDependencies

# ******************************************************************************
# Test typescript setup
# ******************************************************************************
# TEMP: Removed this as we don't support TS currently in Backpack so not important and not worth the failing builds for.
# cd "$temp_app_path"
# npx create-react-app test-app-typescript --template typescript
# cd test-app-typescript

# # Check corresponding template is installed.
# exists node_modules/react-scripts
# exists node_modules/typescript
# exists src/index.tsx
# exists tsconfig.json
# exists src/react-app-env.d.ts
# checkTypeScriptDependencies

# # Check that the TypeScript template passes smoke tests, build, and normal tests
# yarn start --smoke-test
# yarn build
# CI=true yarn test

# # Check eject behaves and works

# # Eject...
# echo yes | npm run eject

# # Temporary workaround for https://github.com/facebook/create-react-app/issues/6099
# rm yarn.lock
# yarn add @babel/plugin-transform-react-jsx-source @babel/plugin-syntax-jsx @babel/plugin-transform-react-jsx @babel/plugin-transform-react-jsx-self @babel/helper-create-regexp-features-plugin

# # Ensure env file still exists
# exists src/react-app-env.d.ts

# # Check that the TypeScript template passes ejected smoke tests, build, and normal tests
# yarn start --smoke-test
# yarn build
# CI=true yarn test

# TODO: Remove this test
# 2022-01-27 Update: This test will always fail because packageName is always `backpack-react-scripts` but not `@skyscanner/backpack-react-scripts`, and this issue comes from `npm` not `backpack-react-scripts`, therefore ignore this test for now, also test https://registry.npmjs.org/@skyscanner/backpack-react-scripts/-/backpack-react-scripts-9.4.0.tgz, it is still broken.
# Detail Here: https://github.com/facebook/create-react-app/blob/main/packages/create-react-app/createReactApp.js#L887-L906
# # ******************************************************************************
# # Test --scripts-version with a tarball url
# # ******************************************************************************

# cd "$temp_app_path"
# npx create-react-app test-app-tarball-url --scripts-version=https://registry.npmjs.org/@skyscanner/backpack-react-scripts/-/backpack-react-scripts-8.0.1.tgz --template @skyscanner/backpack
# cd test-app-tarball-url

# # Check corresponding scripts version is installed.
# exists node_modules/@skyscanner/backpack-react-scripts
# grep '"version": "8.0.1"' node_modules/@skyscanner/backpack-react-scripts/package.json
# checkDependencies

# ******************************************************************************
# Test --scripts-version with a custom fork of react-scripts
# ******************************************************************************

cd "$temp_app_path"
npx create-react-app test-app-fork --scripts-version=react-scripts-fork
cd test-app-fork

# Check corresponding scripts version is installed.
exists node_modules/react-scripts-fork

# TODO: Remove this test
# Detail Here: https://github.com/facebook/create-react-app/blob/main/packages/create-react-app/createReactApp.js#L887-L906
# # ******************************************************************************
# # Test project folder is deleted on failing package installation
# # ******************************************************************************

# cd "$temp_app_path"
# # we will install a non-existing package to simulate a failed installation.
# npx create-react-app test-app-should-not-exist --scripts-version=`date +%s` || true
# # confirm that the project files were deleted
# test ! -e test-app-should-not-exist/package.json
# test ! -d test-app-should-not-exist/node_modules

# TODO: Remove this test
# Detail Here: https://github.com/facebook/create-react-app/blob/main/packages/create-react-app/createReactApp.js#L887-L906
# # ******************************************************************************
# # Test project folder is not deleted when creating app over existing folder
# # ******************************************************************************

# cd "$temp_app_path"
# mkdir test-app-should-remain
# echo '## Hello' > ./test-app-should-remain/README.md
# # we will install a non-existing package to simulate a failed installation.
# npx create-react-app test-app-should-remain --scripts-version=`date +%s` || true
# # confirm the file exist
# test -e test-app-should-remain/README.md
# # confirm only README.md and error log are the only files in the directory
# if [ "$(ls -1 ./test-app-should-remain | wc -l | tr -d '[:space:]')" != "2" ]; then
#   false
# fi

# ******************************************************************************
# Test --scripts-version with a scoped fork tgz of react-scripts
# ******************************************************************************

cd $temp_app_path
curl "https://registry.npmjs.org/@enoah_netzach/react-scripts/-/react-scripts-0.9.0.tgz" -o enoah-scripts-0.9.0.tgz
npx create-react-app test-app-scoped-fork-tgz --scripts-version=$temp_app_path/enoah-scripts-0.9.0.tgz
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

# ******************************************************************************
# Test when PnP is enabled
# ******************************************************************************

# TEMP: Removed as its a yarn feature and we don't support yarn for projects

# cd "$temp_app_path"
# npx create-react-app test-app-pnp --scripts-version=@skyscanner/backpack-react-scripts --template @skyscanner/backpack --use-pnp
# cd test-app-pnp
# ! exists node_modules
# exists .pnp.js
# yarn start --smoke-test
# yarn build

# Cleanup
cleanup
