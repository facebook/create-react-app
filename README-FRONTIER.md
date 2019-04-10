## How to use on a new app

The plan is to incorporate this fork of create-react-app and how to use it within the frontier-cli.  
That being said, if you want to use our fork "manually", then here is how you do it.

1. Make sure you are authenticated with Artifactory

   See https://beta.familysearch.org/frontier/docs/#/start/setup

2. Run the following command

   `npx create-react-app {app-name} --use-npm --scripts-version @fs/react-scripts`

## How to test your local copy of react-scripts

If you have cloned this repo and made changes locally and want to test them before committing and publishing here is how.

1. Clone this repo and make any changes needed in `./packages/react-scripts/`
2. Run the following command  
   `npx create-react-app ${yourNewAppNameHere} --use-npm --scripts-version file:${relativePathToYourClonedCreateReactAppRepo}/packages/react-scripts`

## Development and Cutting a Release

- All development will be done from the develop branch
  - Branch off of develop for any feature/bug fixes
  - PRs will be made into the develop branch
- When the develop branch is in a good state and ready for release follow these steps
  1. Bump the version in `packages/react-scripts/package.json`
  2. Make a PR from develop into frontierMaster
     - Nice url to go straight to making a PR with the correct branches set
       - https://github.com/fs-webdev/create-react-app/compare/frontierMaster...fs-webdev:develop?expand=1
  3. At this point, Travis will pickup the change in frontierMaster and attempt to publish to artifactory

## Merging Upstream changes from Facebook

When we are ready to pull in changes from Facebook, here are the steps

1. Make a PR from facebook's master into our fork's master. This url SHOULD be what you want... please verify before blindly doing anything
   - https://github.com/fs-webdev/create-react-app/compare/master...facebook:master
   - DO NOT SQUASH THE COMMITS when merging the PR. We need to be able to checkout a specific commit later in our steps
2. Locally, check out the master branch and do a `git pull`
3. Find facebook's latest release https://github.com/facebook/create-react-app/releases
4. Find the commit hash corresponding to the release that you want incorporated into our fork.
5. Checkout our develop branch
6. Run `git merge ${HASH_OF_RELEASE_YOU_WANT}`
7. Fix any merge conflicts
8. Bump the 'upstreamVersion' in packages/react-scripts/package.json to match the release of facebook's react-scripts that you merged to
9. Cut a release (follow steps up above)
