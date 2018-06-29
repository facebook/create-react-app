#!/bin/bash
set -ev
#run only on master
if [[ $TRAVIS_PULL_REQUEST == "false" ]] && [[ $TRAVIS_BRANCH == "master" ]]; then
   npm install -g firebase-tools
   npm install -g selenium-webdriver
   npm install codecov.io coveralls
   cd functions
   npm install
   cd ..
fi
