# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the BSD-style license found in the
# LICENSE file in the root directory of this source tree. An additional grant
# of patent rights can be found in the PATENTS file in the same directory.

# Start in tests/ even if run from root directory
cd "$(dirname "$0")"

# Exit the script on any command with non 0 return code
# We assume that all the commands in the pipeline set their return code
# properly and that we do not need to validate that the output is correct
set -e

# Echo every command being executed
set -x

# Go to root
cd ..

# You can only release with npm >= 3
if [ $(npm -v | head -c 1) -lt 3 ]; then
  echo "Releasing requires npm >= 3. Aborting.";
  exit 1;
fi;

if [ -n "$(git status --porcelain)" ]; then
  echo "Your git status is not clean. Aborting.";
  exit 1;
fi

# Update deps
rm -rf node_modules
rm -rf ~/.npm
npm cache clear
npm install

# Force dedupe
npm dedupe

# Don't bundle fsevents because it is optional and OS X-only
# Since it's in optionalDependencies, it will attempt install outside bundle
rm -rf node_modules/fsevents

# This modifies package.json to copy all dependencies to bundledDependencies
# We will revert package.json back after release to avoid doing it every time
node ./node_modules/.bin/bundle-deps

# Go!
npm publish "$@"

# Discard changes to package.json
git checkout -- .
