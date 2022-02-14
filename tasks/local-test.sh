#!/usr/bin/env bash
# Copyright (c) 2015-present, Facebook, Inc.
#
# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.

node_version=14
current_git_branch=`git rev-parse --abbrev-ref HEAD`
git_branch=${current_git_branch}
test_suite=all
interactive=false

function print_help {
  echo "Usage: ${0} [OPTIONS]"
  echo ""
  echo "OPTIONS:"
  echo "  --node-version <version>  the node version to use while testing [${node_version}]"
  echo "  --git-branch <branch>     the git branch to checkout for testing [${current_git_branch}]"
  echo "  --test-suite <suite>      which test suite to use ('all', 'behavior', installs', 'kitchensink', 'kitchensink-eject', 'simple') ['${test_suite}']"
  echo "  --interactive             gain a bash shell after the test run [${interactive}]"
  echo "  --help                    print this message and exit"
  echo ""
}

cd $(dirname $0)

while [ "$1" != "" ]; do
  case $1 in
    "--node-version")
      shift
      node_version=$1
      ;;
    "--git-branch")
      shift
      git_branch=$1
      ;;
    "--test-suite")
      shift
      test_suite=$1
      ;;
    "--interactive")
      interactive=true
      ;;
    "--help")
      print_help
      exit 0
      ;;
  esac
  shift
done

test_command="./tasks/e2e-simple.sh && ./tasks/e2e-kitchensink.sh && ./tasks/e2e-kitchensink-eject.sh && ./tasks/e2e-installs.sh && ./tasks/e2e-behavior.sh"
case ${test_suite} in
  "all")
    ;;
  "simple")
    test_command="./tasks/e2e-simple.sh"
    ;;
  "kitchensink")
    test_command="./tasks/e2e-kitchensink.sh"
    ;;
  "kitchensink-eject")
    test_command="./tasks/e2e-kitchensink-eject.sh"
    ;;
  "installs")
    test_command="./tasks/e2e-installs.sh"
    ;;
  "behavior")
    test_command="./tasks/e2e-behavior.sh"
    ;;
  *)
    ;;
esac

read -r -d '' apply_changes <<- CMD
cd /var/create-react-app
git config --global user.name "Create React App"
git config --global user.email "cra@email.com"
git stash save -u
git stash show -p > patch
git diff 4b825dc642cb6eb9a060e54bf8d69288fbee4904 stash^3 >> patch
git stash pop
cd -
mv /var/create-react-app/patch .
git apply patch
rm patch
git add -A
git commit -m 'Apply local changes'
CMD

if [ ${git_branch} != ${current_git_branch} ]; then
  apply_changes=''
fi

read -r -d '' command <<- CMD
npm install npm@8 -g
export PATH=\$(npm config get prefix -g)/bin:\$PATH
set -x
git clone /var/create-react-app create-react-app --branch ${git_branch}
cd create-react-app
${apply_changes}
node --version
npm --version
npm ci
set +x
${test_command}
result_code=\$?
if [ \$result_code == 0 ]; then
  echo -e "\n\e[1;32m✔ Job passed\e[0m"
else
  echo -e "\n\e[1;31m✘ Job failed\e[0m"
fi
$([[ ${interactive} == 'true' ]] && echo 'bash')
exit \$result_code
CMD

docker run \
  --env CI=true \
  --env NPM_CONFIG_PREFIX=/home/node/.npm \
  --env NPM_CONFIG_QUIET=true \
  --tty \
  --rm \
  --user node \
  --volume ${PWD}/..:/var/create-react-app \
  --workdir /home/node \
  $([[ ${interactive} == 'true' ]] && echo '--interactive') \
  node:${node_version} \
  bash -c "${command}"
