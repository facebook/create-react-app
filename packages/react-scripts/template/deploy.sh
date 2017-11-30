#!/bin/bash
#run only on master
if [[ $TRAVIS_PULL_REQUEST == "false" ]] && [[ $TRAVIS_BRANCH == "master" ]]; then
  firebase use prod --token $FIREBASE_TOKEN
  firebase deploy --non-interactive --token $FIREBASE_TOKEN
fi
