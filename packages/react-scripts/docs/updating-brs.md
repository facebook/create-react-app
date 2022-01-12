# Updating Backpack React Scripts.

## Keeping this fork updated

We wish to keep this fork updated with the upstream repo to benefit from the ongoing open source development
of `create-react-app`. To keep this fork up to date, please follow the steps below:

1. Ensure `master` is in sync with `upstream/master`:

   ```sh
   git checkout master
   git remote add upstream git@github.com:facebook/create-react-app.git
   git fetch upstream
   git reset --hard upstream/master
   git push --force-with-lease
   ```

1. Rebase `fork` on top of a **tagged release** on `master`:

   ```sh
   git checkout fork
   git rebase <commit>
   ```

   > **Note:** `<commit>` should be the SHA-1 of the latest upstream release - _not_ the latest commit i.e. `upstream/master`

1. Pair with someone else to fix any conflicts and cross examine changes in upstream with changes in our fork.

   > This is the most time consuming part. Take care to make sure you are not regressing any functionality that we have added in our fork.

   1. When rebasing its important to note the `webpack.config.ssr.js` file is an exact copy of the `webpack.config.js` file with components commented out that are not required for SSR.

      When rebasing its important to do a comparison between these files to ensure that new functionality is available to SSR and enabled where necessary.

   2. The `package.json` files will all be marked as private for each of the packages except `react-scripts/package.json` this is to prevent lerna from trying to publish new versions of these packages and cause the task to fail due to permissions, as it tries to push to the facebook npms.

1. Re-name your local, rebased `fork` branch to something else and push it to origin. This will ensure it runs through CI and you can verify your changes.

   ```sh
   git branch -m <branch>
   git push origin <branch>
   ```

1. Finally, when we are confident that the rebase has been successful, re-name your branch back to `fork` and push it to origin:

   ```sh
   git branch -m fork
   git push --force-with-lease
   ```

## Releasing a new version of `backpack-react-scripts`

1. Ensure you have run `npm install` in `root`, `packages/react-error-overlay` and `packages/react-scripts`

   - When doing this make sure you remove the `package-lock.json` files that are created in as we don't want these to be published and checked into git.

2. Create a new version that you wish to publish by running the following command. Use the [CHANGELOG.md](./CHANGELOG.md) to decide on the nature of the changes since the last release.

   ```
   (cd packages/react-scripts && npm version major|minor|patch)
   ```

   - This will create a new commit which you will need to push to fork but place it on the last commit by running:

   ```
   gcn! && ggf
   ```

3. To publish a new version of `backpack-react-scripts`, run the following command:

   ```
   npm run publish
   ```

   - If you want to be extra careful, you can publish a prerelease by running this instead:

   ```
   npm run publish -- --canary
   ```

4. Update the [CHANGELOG.md](./CHANGELOG.md) with the new version, taking care to follow the format of previous releases.
