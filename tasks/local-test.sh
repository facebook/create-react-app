#!/usr/bin/env bash
# Copyright (c) 2015-present, Facebook, Inc.
#
# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.

function print_help {
  echo "Usage: ${0} [OPTIONS]"
  echo ""
  echo "OPTIONS:"
  echo "  --node-version <version>  the node version to use while testing [6]"
  echo "  --git-branch <branch>     the git branch to checkout for testing [the current one]"
  echo "  --test-suite <suite>      which test suite to use ('simple', installs', 'kitchensink', 'all') ['all']"
  echo "  --interactive             gain a bash shell after the test run"
  echo "  --help                    print this message and exit"
  echo ""
}

cd $(dirname $0)

node_version=6
current_git_branch=`git rev-parse --abbrev-ref HEAD`
git_branch=${current_git_branch}
test_suite=all
interactive=false

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

test_command="./tasks/e2e-simple.sh && ./tasks/e2e-kitchensink.sh && ./tasks/e2e-installs.sh"
case ${test_suite} in
  "all")
    ;;
  "simple")
    test_command="./tasks/e2e-simple.sh"
    ;;
  "kitchensink")
    test_command="./tasks/e2e-kitchensink.sh"
    ;;
  "installs")
    test_command="./tasks/e2e-installs.sh"
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
CMD

if [ ${git_branch} != ${current_git_branch} ]; then
  apply_changes=''
fi

read -r -d '' command <<- CMD
echo "prefix=~/.npm" > ~/.npmrc
mkdir ~/.npm
export PATH=\$PATH:~/.npm/bin
set -x
git clone /var/create-react-app create-react-app --branch ${git_branch}
cd create-react-app
${apply_changes}
node --version
npm --version
set +x
${test_command} && echo -e "\n\e[1;32m✔ Job passed\e[0m" || echo -e "\n\e[1;31m✘ Job failes\e[0m"
$([[ ${interactive} == 'true' ]] && echo 'bash')
CMD

docker run \
  --env CI=true \
  --env NPM_CONFIG_QUIET=true \
  --tty \
  --user node \
  --volume ${PWD}/..:/var/create-react-app \
  --workdir /home/node \
  $([[ ${interactive} == 'true' ]] && echo '--interactive') \
  node:${node_version} \
  bash -c "${command}"