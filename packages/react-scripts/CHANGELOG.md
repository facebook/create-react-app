# `backpack-react-scripts` Change Log

## 10.0.2

- Fix security issues
  - Add `Node.js requirement` and `Script change` in `README.md`
  - Delete the yarn.lock
  - Bump up 'lerna' to version 5.1.0
  - Bump up 'lerna-changelog' to version 2.2.0
  - Bump up 'browserslist' to version 4.16.5
  - Bump up 'immer' to version 9.0.6

## 10.0.1

- Extract the existing custom features from the BRS fork branch
  - Extract custom `ssr` features into backpack-addons folder

## 10.0.0

### Features

- Added support for loadable components.
- Added `start-ssr` command, to produce Node.js-compatible watched output. Several changes to SSR Webpack config to support.
- Defined `typeof window` for browser and SSR environments, enabling dead code elimination (https://webpack.js.org/plugins/define-plugin/#usage)
- SSR output always includes hash as part of filename
- `web` and `ssr` subpaths for each build's output
- Output build 'status files' (`.build-status`, one for web, one for SSR), which can be watched by a Node.js server to know when builds are in progress or completed.
- Enabled SRI for SSR builds and support loadable SRI hashes

### Fixed

- Fixed an issue with writing stats json for web bundles due to path updates

### Breaking

- Removed `hard-source-webpack-plugin` (So `USE_HARD_SOURCE_WEBPACK_PLUGIN` environment variable can't be used any more)
- Added `build-ssr` command, to indicate that the build is running in SSR mode, `3` steps are required for SSR mode:
  - Add `ssrEnabled` and set it to `true` (The default is `false`) in `backpack-react-scripts` configuration in `package.json`
  - Add `ssr.js` file to `src` folder - Keep this as the same as before
  - Change `build` command to `build-ssr` command - You should know what you are doing is in SSR mode

## 9.6.1

- Extract the existing custom features from the BRS fork branch
  - Extract custom features into backpack-addons files
  - Add backpack-addons README.md

## 9.6.0

- Node.js support limits to >=12.
- Implement sassFunctions inside backpack-react-scripts.
- Remove the dependency of bpk-mixins.
- Upgrade node-sass to v6 ([node-sass Support Node.js 16](https://github.com/sass/node-sass/releases/tag/v6.0.0)), never rely on the peerDenpendecy of node-sass from bpk-mixins, BRS can upgrade node-sass to whatever version it wants.

## 9.5.1

### Changed

- Upgraded `sass-loader` to `v^10.2.1`, to support developers can set UV_THREADPOOL_SIZE environment variable to improve the performance of compiling Sass to CSS

## 9.5.0

Deprecated version. Do not use.

## 9.4.0

- Uninstall `@typescript-eslint/eslint-plugin` and `@typescript-eslint/parser`. These must now be provided either by directly installing them in your project or by an upcoming version of `eslint-config-skyscanner`.

## 9.3.2

### Fixed

- Resolved an issue where generated CSS hashes on class names clashed when using multiple of the same CSS on the page and overriding styles on components. [#103](https://github.com/Skyscanner/backpack-react-scripts/pull/103)
  - It solves this by overriding the `getCSSModuleLocalIdent` from `react-dev-utils/getCSSModuleLocalIdent` to provide the project name as part of the hash that is generated at build. [Issue raised](https://github.com/facebook/create-react-app/issues/10190) with upstream CRA for a integrated fix.

## 9.3.1

- Move `cache-loader` above `resolve-url-loader` to get the best performance
  - Note that there is an overhead for saving the reading and saving the cache file, so only use this loader to cache expensive loaders. It is said that `cache-loader` shouldn't deal with all the loaders and only the expensive parts.
  - Moving `cache-loader` above resolve-url-loader is because cache files it generates after this operation are small and it is faster to read the cache files, and it saves more time than `cache-loader` below resolve-url-loader, we can still speed up the process of compiling sass to css since sass-loader is the most expensive

## 9.3.0

- Apply `cache-loader` on CI
  - Put `cache-loader` before `sass-loader` since `sass-loader` is the most expensive
  - Add `SHOULD_USE_CACHE_LOADER` to control if use `cache-loader` or not since not all the web projects at Skyscanner have applied the cache strategy

## 9.2.0

- Added `ignoreCssWarnings` config item to allow the ability to supress CSS ordering issues when its safe to allow mixed order when it has not effect on output. https://github.com/webpack-contrib/mini-css-extract-plugin#remove-order-warnings

## 9.1.3

- Fixed an issue where webpack paths in SSR were not being utilised.

## 9.1.2

- Updated webpack paths to include the new `@skyscanner/bpk` foundations packages.

## 9.1.1

- Optimize the usage of `thread-loader` to fix `build:storybook` running failed

## 9.1.0

- Add `thread-loader` to speed up webpack workflow by bundling in parallels
- Add `cache-loader` to speed up local development

## 9.0.3

- Rebased onto `upstream/master` v4.0.3 (f92c37a6e6636ed1650ffd976c6881f59b1be803)

## 9.0.2

- Rebased onto `upstream/master` v4.0.1 (de8b2b3f2d0a699284420c19d5b4db0be776e0cf)
- Bumped `@svgr/webpack` to v5.5.0

## 9.0.1

- Fixed an issue where eslint was being shipped, which is not required due to our own linting package.

## 9.0.0

With this change its is only breaking due to the requirement of needing `Jest` to be upgraded to `26.6.0`, nothing else should affect from a consumer perspective.

### Breaking

- Rebased onto `upstream/master` v4.0.0 (ed958938f642007645dd5ac3466db36202f8754e).
- This release rebases `backpack-react-scripts` on top of `create-react-app` v4! The major changes have been summarised in the following blog post:
  [Create React App 4.0](https://github.com/facebook/create-react-app/blob/master/CHANGELOG.md#400-2020-10-23)

- **The only breaking change is the requirement of Jest to be upgraded. Please follow [this guide](./docs/migrating-from-v8-to-v9.md) when upgrading.**

## 8.0.5

- Updated `bpk-mixins` to latest version

## 8.0.4

- Updated `bpk-mixins` to latest version `20.1.5`

## 8.0.3

### Fixed

- Downgraded `sass-loader` to `7.3.1` due to issues with `node-sass` and functional changes to options.

Rebased onto `upstream/master` v3.4.4 (6c009edface3ed63d0c7046f088c675a63c82fdb)

- Update `resolve-url-loader` to `3.1.2` to resolve security vunerability

## 8.0.2

### Fixed

- Updated `lodash` to latest to resolve vunerabilites.

## 8.0.1

### Fixed

- Update `terser-webpack-plugin` to `2.3.8` to resolve security vunerability
- Update `webpack-dev-server` to `3.11.0` to resolve security vunerability

## 8.0.0

### Breaking

- Rebased onto `upstream/master` v3.4.1 (d2f813f8897ffcd2f0b0d2da75d0c44924c92f4d).
- This release rebases `backpack-react-scripts` on top of `create-react-app` v3! The major changes have been summarised in the following blog post:
  [Create React App 3.0](https://github.com/facebook/create-react-app/blob/master/CHANGELOG.md#300-april-22-2019)
- **Some of these changes are breaking. Please follow [this guide](./migrating-from-v7-to-v8.md) when upgrading.**

## 7.0.5 - 2020-01-10

### Fixed

- Reverted change introducted in `7.0.4` that unlocked `babel-loader` version which was causing issues when running BRS scripts

## 7.0.4

### Fixed

- Unlocked `babel-loader` version to allow in range versions.

## 7.0.3 (November 18, 2019)

- Add the ability to split vendor chunks using `vendorChunkRegex`. Anything that matches the regex will be put in the vendors chunk. [See PR from banana project](https://github.skyscannertools.net/dingo/banana/blob/2c5bf3f89bc0d1fec29e7fae27dd5988e99dedec/packages/webapp/package.json#L151)

## 7.0.1 - 2019-09-18

### Fixed

- Update `node-sass` to `4.12.0` to support Node 12 rollout.
- Update `fsevents` to `1.2.9` to support Node 12 rollout.

## 7.0.0 - 2019-01-11

### Breaking

- Rebased onto `upstream/master` v2.1.2 (3e1dc990130c45f57c647e847682ded0ba352c7b)
- This release rebases `backpack-react-scripts` on top of `create-react-app` v2! The major changes have been summarised in the following blog post:
  [Create React App 2.0: Babel 7, Sass, and More.](https://reactjs.org/blog/2018/10/01/create-react-app-v2.html)
- **Some of these changes are breaking. Please follow [this guide](./migrating-from-v6-to-v7.md) when upgrading.**

## 6.0.0 - 2018-11-02

### Breaking

- Add css modules to `.css` imports. This is only valid for projects using css modules

## 5.2.1 - 2018-09-10

### Fixed

- Remove peer dependency warnings
- Remove usage of `bpk-component-grid`

## 5.2.0 - 2018-09-06

### Added

- Rebased onto `upstream/master` v1.1.5 (dc74990b89b5c6e143b522c759be3dac2c286514)
- Upgraded dependencies, mostly `eslint` based.

## 5.1.1 - 2018-04-11

### Fixed

- `backpack-react-scripts` listed inside of `devDependencies` instead of `dependencies`
- `registerServiceWorker.js` no longer appears in project output

## 5.1.0 - 2018-04-10

### Added

- Rebased onto `upstream/master` v1.1.4 (dfbc71ce2ae07547a8544cce14a1a23fac99e071)

## 5.0.10 - 2018-03-21

### Fixed

- New `disablePolyfills` config in `package.json`. You can opt out of including polyfills from the output bundle like so:

```json
  "backpack-react-scripts": {
    "disablePolyfills": true
  }
```

## 5.0.9 - 2018-03-14

### Fixed

- New `crossOriginLoading` config in `package.json`. You can configure cross-origin loading of dynamic chunks:

```json
  "backpack-react-scripts": {
    "crossOriginLoading": "anonymous"
  }
```

## 5.0.8 - 2018-03-07

### Fixed

- New `amdExcludes` config in `package.json`. You can now disable AMD parsing for specific modules like so:

```json
  "backpack-react-scripts": {
    "amdExcludes": [
      "globalize"
    ]
  }
```

## 5.0.7 - 2018-03-06

### Fixed

- Use `package.json` name field as value for `output.jsonpFunction`, this is important for when multiple webpack runtimes from different compilation are used on the same page

## 5.0.6 - 2018-01-31

### Fixed

- CSS Modules hashing now uses `package.json` name field as a salt

## 5.0.5 - 2018-01-15

### Fixed

- Added `saddlebag-` prefix to the jest config

## 5.0.4 - 2018-01-11

### Added

- Added `saddlebag-` prefix for saddlebag modules

## 5.0.3 - 2017-12-21

### Fixed

- Rebased onto `upstream/master` v1.0.17 (4b55193f0ad479f26b0f5e153bb4b152a1ee03e7)
- Peer dependency issues with `postcss-less` & `sugarss`

## 5.0.2 - 2017-11-03

### Fixed

- Scope the disabling of AMD for `lodash` only

## 5.0.1 - 2017-11-02

### Fixed

- Prevent lodash imports from leaking on to the global scope, see https://github.com/webpack/webpack/issues/3017#issuecomment-285954512
- Upgraded `stylelint` to `^8.2.0` and `stylelint-config-skyscanner` to `^1.0.1`

## 5.0.0 - 2017-10-30

### Breaking

- Upgraded [`eslint-config-skyscanner`](https://github.com/Skyscanner/eslint-config-skyscanner/blob/master/changelog.md#300---upgraded-esling-config-airbnb-peer-dependencies) to `3.0.0`.

## 4.0.8 - 2017-10-12

### Fixed

- Rebased onto `upstream/master` (b2c0b3f74b47f0f85e3f17f7d3249b7e536cda05)
- Locked `react` & `react-dom` versions to `^15.0.0` for now

## 4.0.7 - 2017-08-24

### Fixed

- Fixed issue with classnames not being hashed correctly for projects using CSS Modules

## 4.0.6 - 2017-08-22

### Fixed

- Upgraded sass-loader to 6.0.6 which fixes peer dependency warning with webpack (caused shrinkwraps to fail)
- Upgraded bpk-mixins to 16.3.1

## 4.0.5 - 2017-08-17

### Fixed

- Rebased onto `upstream/master` (e8a3e4b2995f4c6e49c0a7ed653a1646a7b5e515)

## 4.0.3 - 2017-08-10

### Fixed

- Production and SSR builds will now use `optimize-css-assets-webpack-plugin` with `cssnano` to optimize output CSS. This gets rid of duplication of global CSS constructs such as keyframes.

## 4.0.2 - 2017-07-28

### Fixed

- Deprecated BpkHeading and BpkParagraph
- Added BpkText component
- Updated all other Backpack dependencies to latest versions

## 4.0.1 - 2017-07-27

### Fixed

- Updated eslint-plugin-import to 2.7.0 to fix `npm shrinkwrap --save-dev`

## 4.0.0 - 2017-07-27

### Changed

- Updated stylelint to 8.0.0 and stylelint-config-skyscanner to 1.0.0

## 3.0.1 - 2017-07-12

### Fixed

- Mocked CSS Modules for Jest, so snapshot tests include the original class names

## 3.0.0 - 2017-07-11

### Changed

- Enabled [CSS Modules](https://github.com/css-modules/css-modules) by default
  - You can use the config option `cssModules` to opt out:
    ```
      "backpack-react-scripts": {
        "cssModules": false
      }
    ```
    In this case, Sass files will not be treated as CSS Modules by default. However, you can opt-in on a
    per-file basis using the naming convention: `*.module.scss`.
  - Backpack components will _always_ be treated as CSS Modules, even if you opt out
  - All Backpack components need to be on these versions (or higher) to work:
    - bpk-component-accordion@1.1.0
    - bpk-component-autosuggest@3.0.13
    - bpk-component-badge@0.1.0
    - bpk-component-banner-alert@1.1.0
    - bpk-component-barchart@0.1.0
    - bpk-component-blockquote@0.1.0
    - bpk-component-breakpoint@0.1.22
    - bpk-component-button@1.6.33
    - bpk-component-calendar@3.3.0
    - bpk-component-card@0.1.0
    - bpk-component-checkbox@1.2.0
    - bpk-component-close-button@0.1.0
    - bpk-component-code@0.1.0
    - bpk-component-content-container@1.1.0
    - bpk-component-datepicker@6.1.1
    - bpk-component-fieldset@0.3.1
    - bpk-component-form-validation@0.1.0
    - bpk-component-grid-toggle@0.1.0
    - bpk-component-grid@1.1.0
    - bpk-component-heading@2.1.0
    - bpk-component-horizontal-nav@0.1.0
    - bpk-component-icon@3.7.0
    - bpk-component-input@3.2.1
    - bpk-component-label@3.2.0
    - bpk-component-link@0.6.0
    - bpk-component-list@0.1.0
    - bpk-component-loading-button@0.1.0
    - bpk-component-modal@1.1.0
    - bpk-component-nudger@0.1.0
    - bpk-component-panel@0.1.0
    - bpk-component-paragraph@0.3.0
    - bpk-component-popover@1.1.0
    - bpk-component-progress@0.1.0
    - bpk-component-radio@1.1.0
    - bpk-component-router-link@0.2.0
    - bpk-component-rtl-toggle@0.0.73
    - bpk-component-select@2.1.0
    - bpk-component-spinner@2.1.0
    - bpk-component-star-rating@0.0.3
    - bpk-component-table@0.1.0
    - bpk-component-textarea@0.1.0
    - bpk-component-ticket@0.1.0
    - bpk-component-tooltip@1.1.0
    - bpk-react-utils@2.0.0

## 2.0.3 - 2017-07-010

### Fixed

- Rebased onto `upstream/master` (f495c15578403cf2dbac211493ae8fb6ac742415)

## 2.0.1 - 2017-07-04

### Changed

- Replaced the "babelIncludeRegex" config option in `package.json` with "babelIncludePrefixes". You can now
  enable transpilation for your dependencies by adding package prefixes like so:
  ```
  {
    ...
    "backpack-react-scripts": {
      "babelIncludePrefixes": [
        "my-module-prefix-",
        "some-dependency"
      ]
    }
  }
  ```

### Changed

- Upgraded `eslint-config-skyscanner` to `2.0.0` which uses the `babel-eslint` parse

## 1.0.1 - 2017-06-12

### Added

- Added `babel-eslint` as dependency so it can be used with ESLint when dynamic `import()` statements are used

### Changed

- Upgraded `eslint-config-skyscanner` to `2.0.0` which uses the `babel-eslint` parse

## 1.0.0 - 2017-05-29

### Changed

- Rebased from `upstream/master` (fbaeff2d6ef83ae5dc8213150e0fa6589ed29150)
- TLDR; this upgrades the upstream dependency `react-scripts` to `^1.0.0` - please read the [blog post](https://facebook.github.io/react/blog/2017/05/18/whats-new-in-create-react-app.html) for a summary of the new features this brings
- This is a major release, meaning there are a few breaking changes (summarised below). Please refer to the [`react-scripts` changelog](https://github.com/facebookincubator/create-react-app/blob/master/CHANGELOG.md#100-may-18-2017) for detailed migration documentations.
  - [Ensure application and test files reside in src/](https://github.com/facebookincubator/create-react-app/blob/master/CHANGELOG.md#ensure-application-and-test-files-reside-in-src)
  - [You can no longer import file content](https://github.com/facebookincubator/create-react-app/blob/master/CHANGELOG.md#you-can-no-longer-import-file-content)
  - [Confusing window globals can no longer be used without window qualifier](https://github.com/facebookincubator/create-react-app/blob/master/CHANGELOG.md#confusing-window-globals-can-no-longer-be-used-without-window-qualifier)
  - [Jest snapshot format has changed](https://github.com/facebookincubator/create-react-app/blob/master/CHANGELOG.md#how-do-i-make-my-tests-work-with-jest-20)

## 0.0.19 - 2017-05-02

### Added

- The ability to configure "babelIncludeRegex" in package json

## 0.0.18 - 2017-04-10

### Added

- Support for new `bpk-icon` mixin from `bpk-mixins`

## 0.0.17 - 2017-04-06

### Fixed

- Rebased from `upstream/0.9.x` (ebebe80383eb15b4759a0cd5ea12015eaac94c0e)
- Now moves `react` and `react-dom` from dependencies to devDependencies

## 0.0.16 - 2017-03-30

### Added

- Upgrading `eslint-config-skyscanner` to v1.1.0
- Upgrading `stylelint-config-skyscanner` to v0.1.3
- Upgrading `eslint-plugin-react` to v6.10.3 as [undelying issue](https://github.com/yannickcr/eslint-plugin-react/issues/1117) which caused it to be pinned was resolved
- Upgrading `node-sass` to v4.5.0 to make it compatible with latest version of `bpk-mixins`
- Upgrading all Backpack dev dependencies:
  - `bpk-component-button` to v1.6.6
  - `bpk-component-code` to v0.0.58
  - `bpk-component-grid` to v1.0.8
  - `bpk-component-heading` to v1.2.7
  - `bpk-component-paragraph` to v0.2.1
  - `bpk-mixins` to v11.0.2
  - `bpk-stylesheets` to v3.2.16
- Upgrading `detect-port` to v1.1.1

## 0.0.15 - 2017-03-27

### Added

- The ability to lint SCSS with `stylelint-config-skyscanner`
  - run `npm run lint:scss` or just `npm run lint` for both JS and SCSS linting
- The ability to automatically fix many SCSS linting issues using `stylefmt`
  - run `npm run lint:scss:fix`
- The ability to automatically fix many JS linting issues using `eslint --fix`
  - run `npm run lint:js:fix`

## 0.0.14 - 2017-03-20

### Added

- Upgrading `eslint-config-skyscanner` to v1.0.0

### Fixed

- Pinning `eslint-plugin-react` to 6.10.0 to fix indent bug

## 0.0.13 - 2017-03-09

### Added

- The ability to configure "ssrExternals" in package json

## 0.0.12 - 2017-03-01

### Fixed

- The backpack module regex now works on windows

## 0.0.11 - 2017-02-27

### Changed

- Removed backpack logo usage from output template

### Added

- There is now an `.editorconfig` in the output template

## 0.0.10 - 2017-01-05

### Changed

- Rebased from `upstream/master` (4d7b7544e74db1aaca22e847b233ed1f3b95b72b)
  - Updates `babel-jest` && `jest` packages to 18.0.0
- Upgraded `eslint` & `eslint-plugin-react` to 3.12.2 & 6.8.0 respectively

### Added

- Added ability to configure "externals" in package json

## 0.0.9 - 2016-12-20

### Added

- Server Side Rendering support (proof of concept):
  - `webpack.config.ssr.js`: This is a duplicate of `webpack.config.prod.js` modified to target a server side node environment
  - `build.js` now checks if an `ssr.js` file exists at the app root, if so it will compile it in parallel with the optimized browser bundle leaving an
    `ssr.js` file in the build directory ready to be required on the server
  - See the [readme](https://github.com/Skyscanner/backpack-react-scripts/tree/master/packages/react-scripts/template#server-side-rendering-ssr) for detailed instructions.

## 0.0.8

### Changed

- Rebased from `upstream/master` (94c912dc60561c931232caf9cf5442082711227c)
  - Mostly bug fixes and dependency upgrades, see [create-react-app's changelog](https://github.com/facebookincubator/create-react-app/blob/master/CHANGELOG.md)
    (between versions `v0.8.0` -> `v0.8.4`)

## 0.0.7

### Fixed

- Added base stylesheet scripts to the template so that hover effects work

## 0.0.6

### Changed

- Removed eslint from webpack to a separate `npm run lint` task
- Swapped out `eslint-config-react-app` in favour of `eslint-config-skyscanner`

### Added

- A `backpack-react-scripts` specific readme

## 0.0.5

### Fixed

- Rebased from `upstream/master` (bcc469c9a5c7916ec10786f133769cdda2c80188)
  - Most notable change is Yarn support

## 0.0.4

### Fixed

- Reverted nested components dir

## 0.0.3

### Added

- New Backpack template
  - Backpack stylesheet and Sass mixin integration
  - Backpack button, code, grid, heading & paragraph components integration
  - `.eslintrc` for editor integration
  - Nested components into `src/components/` dir

## 0.0.2

### Fixed

- Removed `bundledDependencies`

## 0.0.1

### Changed

- Customised `react-scripts` package to be `backpack-react-scripts`
- Marked all other packages as private

### Added

- Sass stylesheet support
- Babel will now compile imports from the `node_modules` folder that match `/bpk-*`
- Drone build configuration
