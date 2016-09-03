# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the BSD-style license found in the
# LICENSE file in the root directory of this source tree. An additional grant
# of patent rights can be found in the PATENTS file in the same directory.

# This script cleans up the code from blocks only used during local development.
# We call this as part of the `release.sh` script.
# On success, the only output to stdout is the package name.

# Start in /tasks even if run from root directory
cd "$(dirname "$0")"

# Print error messages to stderr.
# The calling script may then handle them.
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
  # Uncomment when snapshot testing is enabled by default:
  # rm ../template/src/__snapshots__/App.test.js.snap
  rm -rf ../$clean_path
}

# Exit the script with a helpful error message when any error is encountered
trap 'set +x; handle_error $LINENO $BASH_COMMAND' ERR

# Cleanup before exit on any termination signal
trap 'set +x; handle_exit' SIGQUIT SIGTERM SIGINT SIGKILL SIGHUP

# Go to root
initial_path=$PWD
cd ..

# Create a temporary clean folder that contains production-only code.
# Do not overwrite any files in the current folder.
clean_path=`mktemp -d 2>/dev/null || mktemp -d -t 'clean_path'`

# Copy some of the project files to the temporary folder.
# Exclude folders that definitely won’t be part of the package from processing.
# We will strip the dev-only code there, and then copy files back.
rsync -av --exclude='.git' --exclude=$clean_path\
  --exclude='node_modules' --exclude='build'\
  './' $clean_path  >/dev/null

# Now remove all the code relevant to development of Create React App.
cd $clean_path
files="$(find -L . -name "*.js" -type f)"
for file in $files; do
  sed -i.bak '/\/\/ @remove-on-publish-begin/,/\/\/ @remove-on-publish-end/d' $file
  rm $file.bak
done

# Pack!
packname=`npm pack`

# Now we can copy the package back.
cd ..
cp -f $clean_path/$packname ./
cleanup

# Output the package name so `release.sh` can pick it up.
echo $packname
