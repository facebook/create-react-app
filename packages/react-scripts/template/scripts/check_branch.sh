#!/bin/bash
if [[ "$(git branch | grep \* | cut -f2 -d ' ')" == "master" ]]; then
  echo "Direct commits to master are prohibited. Please make a PR."
  exit 1
fi
if [[ "$(git branch | grep \* | cut -f2 -d ' ')" == "develop" ]]; then
  echo "Direct commits to develop are prohibited. Please make a PR."
  exit 1
fi
exit 0
