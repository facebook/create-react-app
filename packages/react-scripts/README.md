# backpack-react-scripts

This package is a fork of [Create React App](https://github.com/facebookincubator/create-react-app) (specifically the 
`react-scripts` package). It's intended to be used in conjuction with `create-react-app` like so:

```sh
# we still rely on facebooks global `create-react-app` cli
npm install -g create-react-app

# specify `backpack-react-scripts` as the scripts package to use
create-react-app my-app --scripts-version=backpack-react-scripts

# start your app development like you normally would with `create-react-app`
cd my-app
npm start
```

## Why fork?

Out of the box, `create-react-app` doesn't work well with Backpack components because it has no support for
Sass stylesheets or uncompiled dependencies in the `node_modules` folder. We also want to be able to tailor
the template to use Backpack out-the-box.

## What is different in our fork?

This is a high-level overview of the changed we made to this fork.

### Moved ESLint from Webpack to npm script

> See `config/webpack.config.{dev,prod}.js`, `package.json`, `scripts/{eject,init}.js`, `template/.eslintrc`

By default, react-scripts runs all code through ESLint *on build*. As our [ESLint configuration](https://github.com/Skyscanner/eslint-config-skyscanner) is quite opinionated, we have disabled this functionality.

We have added an npm script so you can still run the linter at will using `npm run lint`.

### Added stylelint configuration

> See `package.json`, `template/.stylelintrc.json`

We added Skyscanner's [Stylelint configuration](https://github.com/Skyscanner/stylelint-config-skyscanner/).

### Added in Backpack components

> See `scripts/init.js`, `template/src/*`

We pre-install some Backpack components to help you get started quickly.

### Added a server-side rendering (SSR) Webpack configuration

> See `config/webpack.config.ssr.js`

This Webpack configuration is used to to enable easy server-side rendering. It is derived from `config/webpack.config.prod.js`.

Everything that we don't need from the prod config is not removed, but *commented out*.

### Moved React and ReactDOM from `dependencies` to `devDependencies`

> See `scripts/init.js`

Any app built with backpack-react-scripts should always output a bundle, and therefore it is enough to keep React and ReactDOM in `devDependencies`. In many cases, they should also be external dependencies (not part of the bundle).

As the CRA CLI install React and ReactDOM, we cannot really do anything about that; but we can move the entries in `package.json` from `dependencies` to `devDependencies`.

### Enabled CSS Modules

> See `config/webpack.config.{dev,prod,ssr}.js`

All Sass files are by default treated as [CSS Modules](https://github.com/css-modules/css-modules). You can opt out of this behaviour using the following config option:

```
"backpack-react-scripts": {
  "cssModules": false
}
```

If you decide to opt out, Sass files will not be treated as CSS Modules by default. However, you can opt-in on a per-file basis using the naming convention: `*.module.scss`.

> Backpack components will _always_ be treated as CSS Modules, even if you opt out

## Releasing a new version of `backpack-react-scripts`

1. To publish a new version of `backpack-react-scripts`, run the following command:
    
    ```
    npm run publish -- --scope backpack-react-scripts
    ```

1. You will be prompted to select a new semver version (MAJOR, MINOR, PATCH). Use the [CHANGELOG.md](./CHANGELOG.md) to decide on the nature of the changes since the last release.
    * If you want to be extra careful, you can publish a prerelease by running this instead:
    
    ```
    npm run publish -- --scope backpack-react-scripts --canary
    ```

1. Update the [CHANGELOG.md](./CHANGELOG.md) with the new version, taking care to follow the format of previous releases.

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
