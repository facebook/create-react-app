# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the BSD-style license found in the
# LICENSE file in the root directory of this source tree. An additional grant
# of patent rights can be found in the PATENTS file in the same directory.

# In success case, the only output to stdout is the packagename,
#   which might be used by the caller of `tasks/clean_pack.sh`

# Start even if run from root directory
cd "$(dirname "$0")"

# print error messages to stderr
# the cleanup function is optionally defined in caller script
function handle_error {
  echo "$(basename $0): \033[31mERROR!\033[m An error was encountered executing \033[36mline $1\033[m." 1>&2;
  cleanup
  echo 'Exiting with error.' 1>&2;
  exit 1
}

function handle_exit {
  cleanup
  echo 'Exiting without error.' 1>&2;
  exit
}

function cleanup {
  cd $initial_path
  # remove Jest snap test file from local dev project if exists
  rm ../template/src/__tests__/__snapshots__/App-test.js.snap
  rm -rf ../$clean_path
}

# Exit the script with a helpful error message when any error is encountered
trap 'set +x; handle_error $LINENO $BASH_COMMAND' ERR

# Cleanup before exit on any termination signal
trap 'set +x; handle_exit' SIGQUIT SIGTERM SIGINT SIGKILL SIGHUP

# `tasks/clean_pack.sh` the two directories to make sure they are valid npm modules
initial_path=$PWD

# Go to root
cd ..
# create a temporary clean folder that contains production only code
#   do not overwrite any files in the current folder
clean_path=`mktemp -d clean_XXXX`

# copy files to folder .clean-pack
#   `npm publish` looks package.json, if it has a files field, only pack listed files
#   follwoing folders, although not listed in the files field, are not copied
#   - .git : contains lot of small files
#   - $clean_path : the destination folder
#   - node_modules : contains lots of small files
#   - build : .gitignored folder used in local development
rsync -av --exclude='.git' --exclude=$clean_path\
          --exclude='node_modules' --exclude='build'\
     './' $clean_path  >/dev/null

cd $clean_path

# remove dev-only code
files="$(find -L . -name "*.js" -type f)"
for file in $files; do
  sed -i.bak '/\/\/ @remove-on-publish-begin/,/\/\/ @remove-on-publish-end/d' $file
  rm $file.bak
done

# Pack!
packname=`npm pack`

# copy package to current folder
cd ..
cp -f $clean_path/$packname ./
cleanup
echo $packname
