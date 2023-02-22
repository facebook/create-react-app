# Information About iModel.js Specific Fork

This README is intended to cover the differences between the iModel.js specific fork and how it relates to the upstream of [Create-React-App](https://github.com/facebook/create-react-app).

Current upstream is `react-scripts@5.0.1`, a diff of upstream and this fork can be found [here](https://github.com/imodeljs/create-react-app/compare/master...imodeljs)

## Differences

- Additional configuration options

  > Note: These configuration variables are an extension of the [Advanced Configurations](https://create-react-app.dev/docs/advanced-configuration) supported by create-react-app.

  | Variable                | Development | Production | Usage                                                                                                                                                                                                |
  | ----------------------- | ----------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | USE_FAST_SASS           | ✅ Used     | ✅ Used    | When set to `true`, use the `fast-sass-loader` instead of `sass-loader`. This helps with long build times on smaller machines attempting to build an app with a large amount of scss/sass files.         |
  | USE_FULL_SOURCEMAP      | ✅ Used     | 🚫 Ignored | When set to `true`, the sourcemaps generated use `source-map` instead of `cheap-module-source-map`. This is known to cause out-of-memory errors but gives full fidelity source maps in debug builds. |
  | TRANSPILE_DEPS          | ✅ Used     | ✅ Used    | When set to `false`, webpack will not run babel on anything in node_modules. Transpiling dependencies can be costly, and is often not necessary when targeting newer browsers. |
  | DISABLE_TERSER          | 🚫 Ignored  | ✅ Used    | When set to `true`, skips all minification. Useful for PR builds and test apps. |
  | DISABLE_COPY_ASSETS     | ✅ Used     | ✅ Used    | When set to `true`, skips applying the copy plugin to extract assets from @bentley or @itwinjs packages. |
  | USING_NPM               | ✅ Used     | ✅ Used    | When set to `true`, indicates that the application uses npm instead of pnpm. This disables a pnpm workaround while copying assets. (The pnpm workaround prevents assets copying from working in npm.) Ignored if `DISABLE_COPY_ASSETS` is `true`. |

- Typing changes

  - By default, typescript tests are not type checked causing issue when trying to compile them later.
  - Update the Jest configuration to support type checking
    - In 'packages/react-scripts/scripts/utils/createJestConfig.js',
      - add a global to the config for 'ts-jest'
      - add a new transform for ts and tsx files for ts-jest

- Support `imjs_` prefixed environment variables
  - iModel.js places special significance on environment variables starting with `imjs_`. The `REACT_APP_` functionality has been extended to include the `imjs_` as well.

## Updating with upstream facebook/create-react-app

1. Push upstream `master` to imodeljs `master`, there should _never_ be any conflicts. (Request an admin to do this when opening the PR in the next step)
   ```sh
   git remote add upstream https://github.com/facebook/create-react-app.git
   git fetch upstream
   git checkout master
   git merge upstream/master
   git push
   ```
1. Update `imodeljs` branch with new imodeljs `master`
   a.
   ```sh
   git checkout imodeljs
   git checkout -b merge-with-master
   git merge origin/master
   ```
   b. Resolve merge conflicts
   c. Set the version of react-scripts to `-dev.0` of whatever is incoming from `master`
   c. Commit, push and open PR

> Note: The main reason to create a PR branch is to have a linear first-parent history for all explicit changes to our branch instead of directly pushing overtop of them all. That way it's an explicit merge commit instead of a fast-forward merge.
