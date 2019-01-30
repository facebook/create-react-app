## How to use on a new app

The plan is to incorporate this fork of create-react-app and how to use it within the frontier-cli.  
That being said, if you want to use our fork "manually", then here is how you do it.

1. Make sure you are authenticated with Artifactory

- TODO: put those steps here or link to those steps

2. Run the following command  
   `npx create-react-app {app-name} --scripts-version @fs/react-scripts`

## How to test your local copy of react-scripts

If you have cloned this repo and made changes locally and want to test them before committing and publishing here is how.

1. Clone this repo and make any changes needed in `./packages/react-scripts/`
2. Run the following command  
   `npx create-react-app ${yourNewAppsNameHere} --scripts-version file:${relativePathToYourClonedCreateReactAppRepo}/packages/react-scripts`

## Development and Cutting a Release

- All development will be done from the develop branch
  - Branch off of develop for any feature/bug fixes
  - PRs will be made into the develop branch
- When the develop branch is in a good state and ready for release follow these steps
  1. Bump the version in `packages/react-scripts/package.json`
  2. Make a PR from develop into frontierMaster
     - Squash commits and merge.
  3. At this point, Travis will pickup the change in frontierMaster and attempt to publish to artifactory

## Merging Upstream changes from Facebook

When we are ready to pull in changes from Facebook, here are the steps

1. Make a PR from facebook's master into our fork's master. This url SHOULD be what you want... please verify before blindly doing anything
   - https://github.com/fs-webdev/create-react-app/compare/master...facebook:master
   - DO NOT SQUASH THE COMMITS when merging the PR. We need to be able to checkout a specific commit later in our steps
2. Find facebook's latest release https://github.com/facebook/create-react-app/releases
3. Find the commit hash corresponding to the release that you want incorporated into our fork.
4. Checkout our develop branch
5. Run `git merge ${HASH_OF_RELEASE_YOU_WANT}`
6. Fix any merge conflicts
7. Probably a good idea to cut a release at that point.
