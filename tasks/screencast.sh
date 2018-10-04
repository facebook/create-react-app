#!/bin/zsh
# Copyright (c) 2015-present, Facebook, Inc.
#
# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.

# ******************************************************************************
# This is an end-to-end test intended to be run via screencast.js
# Dependencies: asciinema, pv, core-utils
# ******************************************************************************
set -e

printf '\e[32m%s\e[m' "λ "
echo "npx create-react-app my-app" | pv -qL $[10+(-2 + RANDOM%5)]
npx create-react-app my-app

printf '\e[32m%s\e[m' "λ "
sleep 1
echo "cd my-app" | pv -qL $[10+(-2 + RANDOM%5)]
cd my-app

printf '\e[32m%s\e[m' "λ "
sleep 1
echo "npm start" | pv -qL $[10+(-2 + RANDOM%5)]

BROWSER="none" node "$(dirname $0)/screencast-start.js" \
    --command "npm start" \
    --pattern="Compiled successfully*" \
    --pattern-count 2 \
    --error-pattern="*already running on port" \
    --timeout 10

echo ""