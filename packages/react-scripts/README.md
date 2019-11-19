# backpack-react-scripts

This package is a fork of [Create React App](https://github.com/facebookincubator/create-react-app) (specifically the
`react-scripts` package). It's intended to be used in conjuction with `create-react-app` like so:

```sh
npx create-react-app my-app --scripts-version=backpack-react-scripts

# start your app development like you normally would with `create-react-app`
cd my-app
npm start
```

## What is different in our fork?

- Compilation of uncompiled Backpack components (specifically JSX).
- Skyscanner specific template with Backpack components integrated out of the box.
- CSS Modules enabled by default for all `.css` & `.scss` files.
- Ability to create a bundle for server side rending.
- Automatic chunking is disabled by default.
- **`css.html` & `js.html`**: New files in the `build/` output folder. These are html partials that include `<script />` and `<link />` references to the various static assets output by webpack. Useful if automatic chunking is turned on and you don't want to worry about order.
- A bunch of configuration options via `"backpack-react-scripts"` field in `package.json`:
  - `crossOriginLoading`: Modify the default behaviour, see [docs](https://webpack.js.org/configuration/output/#output-crossoriginloading).
  - `babelIncludePrefixes`: An array of module name prefixes to opt into babel compilation. Includes `["bpk-", "saddlebag-"]` by default.
  - `enableAutomaticChunking`: Boolean, opt in to automatic chunking of vendor, common and app code.
  - `vendorsChunkRegex`: String, Regex for picking what goes into the `vendors` chunk. See `cacheGroups` in webpack docs. Dependent on `enableAutomaticChunking` being enabled
  - `amdExcludes`: Array of module names to exclude from AMD parsing. Incldues `["lodash"]` by default.
  - `externals`: exposing the Webpack config to modify externals, see [docs](https://webpack.js.org/configuration/externals/).
  - `ssrExternals`: Similar to above, but for `ssr.js` only.
  - `cssModules`: Boolean, true by default.

## Releasing a new version of `backpack-react-scripts`

1. To publish a new version of `backpack-react-scripts`, run the following command:

   ```
   npm run publish -- --scope backpack-react-scripts
   ```

2. You will be prompted to select a new semver version (MAJOR, MINOR, PATCH). Use the [CHANGELOG.md](./CHANGELOG.md) to decide on the nature of the changes since the last release.

   - If you want to be extra careful, you can publish a prerelease by running this instead:

   ```
   npm run publish -- --scope backpack-react-scripts --canary
   ```

3. Update the [CHANGELOG.md](./CHANGELOG.md) with the new version, taking care to follow the format of previous releases.

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

   > **Note:** `<commit>` should be the SHA-1 of the latest upstream release - _not_ just the latest i.e. `upstream/master`

1. Pair with someone else to fix any conflicts and cross examine changes in upstream with changes in our fork.

   > This is the most time consuming part. Take care to make sure you are not regressing any functionality that we have added in our fork.

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
