#!/usr/bin/env bash
# Copyright (c) 2015-present, Facebook, Inc.
#
# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.

# ******************************************************************************
# Use this to run the end-to-end tests locally or in CI.
# If CI is set to true, then it will run them directly,
# otherwise it will use a Docker container.
# ******************************************************************************

if [[ "$CI" == "true" ]]; then
	source $(dirname "$0")/$1.sh
	exit $?
fi

# Go to directory containing this script and get a reference to the root of the repo
cd $(dirname $0)
root_path=$(readlink -f "../..")

# Set all the default values for the options
node_version=16
npm_version=8
current_git_branch=`git rev-parse --abbrev-ref HEAD`
git_branch=${current_git_branch}
test_suites=()
interactive=false
arg_docker_image=""

function get_all_suites {
	echo $(find . -type f -regex "^./[a-z-]*.sh$" | sed "s|^./\(.*\).sh$|\1|" | sort | tr "\n" " ")
}

function print_help {
	local name=""
	[[ -z "$npm_lifecycle_event" ]] && name=$0 || name="npm run $npm_lifecycle_event --"

	echo "Usage: ${name} [TEST_SUITE TEST_SUITE...] [OPTIONS]"
	echo ""
	echo "Test Suites [defaults to all except 'old-node']:"
	printf "  - %s\n" $(get_all_suites)
	echo ""
	echo "OPTIONS:"
	echo "  --node-version <version>  the node version to use while testing [${node_version}]"
	echo "  --npm-version <version>   the npm version to use while testing [${npm_version}]"
	echo "  --git-branch <branch>     the git branch to checkout for testing [${current_git_branch}]"
	echo "  --docker-image <image>    a prebuilt docker image to use [node:${node_version}]"
	echo "  --interactive             gain a bash shell after the test run [${interactive}]"
	echo "  --help                    print this message and exit"
	echo ""
}

while [ "$1" != "" ]; do
	if [[ "$1" == --* ]]; then
		case $1 in
			"--node-version")
				shift
				node_version=$1
				;;
			"--npm-version")
				shift
				npm_version=$1
				;;
			"--git-branch")
				shift
				git_branch=$1
				;;
			"--docker-image")
				shift
				arg_docker_image=$1
				;;
			"--interactive")
				interactive=true
				;;
			"--help")
				print_help
				exit 0
				;;
		esac
	else
		if [[ ! " $(get_all_suites) " =~ " ${1} " ]]; then
			# Putting in an incorrect test suite wont error out for a long
			# time so exit early if its not a test suite we know about
			echo "Error: Test suite \"$1\" does not exist"
			echo ""
			print_help
			exit 1
		fi
		test_suites+=($1)
	fi
	shift
done

function get_test_command {
	local test_command=""
	local run_all_suites=false
	local IFS=" "
	local all_suites=()
	read -r -a all_suites <<< "$(get_all_suites)"

	# by default run all test suites except old node
	[[ ${#test_suites[@]} -eq 0 ]] && run_all_suites=true
	if [[ "$run_all_suites" == "true" ]]; then
		test_suites=("${all_suites[@]}")
	fi

	for test_suite in "${test_suites[@]}"; do
		command="./test/e2e/$test_suite.sh"

		if [[ "$test_suite" == "old-node" ]]; then
			if [[ "$run_all_suites" == "true" ]]; then
				# If nothing is passed in then use everything except old-node
				continue
			else
				# if old-node was requested then run it by itself
				test_command="${command}"
				break
			fi
		fi

		test_command="${test_command:-true} && ${command}"
	done

	echo "$test_command"
}

function get_apply_command {
	local command=""

	# The repo gets checked out into the docker container so if we are
	# checking out the current branch then apply and commit any local changes.
	# This is done by adding anything returned from git status to a tarball
	# and unpacking it in the new repo. This allows no changes to the mounted
	# local repo and allows Docker to mount it as a readonly fs to ensure
	# nothing is changed locally
	if [[ "${git_branch}" == "${current_git_branch}" ]]; then
		read -r -d "" command <<- CMD
			cd /var/create-react-app
			if [[ ! -z "\$(git status --porcelain)" ]]; then
				tar cvf \$HOME/local-changes.tar \$(git status --porcelain | awk {'print \$2'})
			fi
			cd -
			if [[ -f "\$HOME/local-changes.tar" ]]; then
				tar -xf \$HOME/local-changes.tar -C .
				rm \$HOME/local-changes.tar
				git config --global user.name "Create React App"
				git config --global user.email "cra@email.com"
				git add -A
				git commit -m "Apply local changes" -n
			fi
		CMD
	fi

	echo "$command"
}

function get_docker_command {
	local command=""
	local update_npm_command=""
	local interactive_command=""

	[[ "${npm_version}" != "" ]] && update_npm_command="npm install npm@${npm_version} -g"
	[[ "${interactive}" == "true" ]] && interactive_command="bash"

	# Note that you must escape any variables that should not be
	# evaluated until they are run inside the docker container
	read -r -d "" command <<- CMD
		set -x
		${update_npm_command}
		export PATH=\$(npm config get prefix -g)/bin:\$PATH
		node --version
		npm --version
		if [[ ! -d "create-react-app" ]]; then
			git clone /var/create-react-app create-react-app --branch ${git_branch}
		fi
		cd create-react-app
		$(get_apply_command)
		[[ ! -d "node_modules" ]] && npm ci
		$(get_test_command)
		result_code=\$?
		if [ \$result_code == 0 ]; then
			echo -e "\n\e[1;32m✔ Job passed\e[0m"
		else
			echo -e "\n\e[1;31m✘ Job failed\e[0m"
		fi
		${interactive_command}
		exit \$result_code
	CMD

	echo "$command"
}

function run_docker {
	local docker_command=$(get_docker_command)
	
	local interactive_flag=""
	[[ "${interactive}" == "true" ]] && interactive_flag="--interactive"

	[[ "$docker_command" == *"/old-node.sh"* ]] && node_version=12
	local docker_image=${arg_docker_image:-node:${node_version}}

	set -x
	docker run \
		--env CI=true \
		--env NPM_CONFIG_PREFIX="/home/node/.npm" \
		--tty \
		--rm \
		--user node \
		--volume ${root_path}:/var/create-react-app:ro \
		--workdir /home/node \
		${interactive_flag} \
		${docker_image} \
		bash -c "${docker_command}"
}

run_docker
