#!/bin/bash
# Copyright (c) 2015-present, Facebook, Inc.
#
# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.

# ******************************************************************************
# This is an end-to-end test intended to run on CI.
# You can also run it locally but it's slow.
# ******************************************************************************

# Source shared functions/vars and setup
source $(dirname "$0")/_setup.sh

# If the node version is < 10, the script should just give an error.
cd $temp_app_path
err_output=`node "$root_path"/packages/create-react-app/index.js test-node-version 2>&1 > /dev/null || echo ''`
[[ $err_output =~ You\ are\ running\ Node ]] && exit 0 || exit 1

# Cleanup
cleanup
