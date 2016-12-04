## 0.8.1 (2016-12-04)

#### :bug: Bug Fix
* `react-scripts`
  * [#1149](https://github.com/facebookincubator/create-react-app/pull/1149) Fix incorrectly stubbing JavaScript files with a dot in the import path in tests. ([@fson](https://github.com/fson))

### Migrating from 0.8.0 to 0.8.1

Inside any created project that has not been ejected, run:

```
npm install --save-dev --save-exact react-scripts@0.8.1
```

## 0.8.0 (2016-12-03)

#### :rocket: New Feature
* `react-scripts`
  * [#944](https://github.com/facebookincubator/create-react-app/pull/944) Crash the build during CI whenever linter warnings are encountered. ([@excitement-engineer](https://github.com/excitement-engineer))

    Linter warnings and errors are now checked during a continuous integration build (set by the `CI` environment variable) and the build will fail if any issues are found. See [Continuous Integration](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md#continuous-integration) for more information.

  * [#1090](https://github.com/facebookincubator/create-react-app/pull/1090) Enable proxying of WebSockets. ([@dceddia](https://github.com/dceddia))

* `create-react-app`, `react-scripts`
  * [#898](https://github.com/facebookincubator/create-react-app/pull/898) Support Yarn. ([@fson](https://github.com/fson))

    Yarn is a new fast, reliable and secure alternative to the `npm` client. If you have Yarn installed, `create-react-app` will use it to install packages when you create an app. It also creates a `yarn.lock` file that should be checked into source control (e.g. git). This ensures the same versions of packages will be installed each time `yarn install` is run, on any machine.

    `react-scripts` now also displays instructions using `yarn` commands for projects using Yarn (projects having a `yarn.lock` file).

    To create a project using Yarn, simply install `yarn` and use `create-react-app` like before:
    ```
    npm install -g yarn create-react-app@latest

    create-react-app my-app  # Packages are now installed with Yarn.
    ```

#### :boom: Breaking Change
* `babel-preset-react-app`
  * [#902](https://github.com/facebookincubator/create-react-app/pull/902) Enable useBuiltIns option on object-rest-spread. ([@existentialism](https://github.com/existentialism))

    Object rest spread and JSX now use the native `Object.assign()` method instead of Babel's helper function. If you are using `babel-preset-react-app` directly in your project *and* targeting browsers that don't have `Object.assign()` available, from now on you need a polyfill for it (e.g. [`object-assign`](https://www.npmjs.com/package/object-assign)).

    **Note:** `react-scripts` already adds this polyfill, so no changes are necessary in Create React App projects.

#### :bug: Bug Fix
* `react-scripts`
  * [#978](https://github.com/facebookincubator/create-react-app/pull/978) Move the remove-on-eject-end tag at the end of the file. ([@EnoahNetzach](https://github.com/EnoahNetzach))

    Fixes a bug in ejected configuration.

  * [#1017](https://github.com/facebookincubator/create-react-app/pull/1017) Don't look for `.babelrc` file during test. ([@nhajidin](https://github.com/nhajidin))

    Fixes a `.babelrc` file in a parent directory interfering with the `npm test` command.

  * [#951](https://github.com/facebookincubator/create-react-app/pull/951) Check for presence of folders before continuing eject. ([@heldinz](https://github.com/heldinz))

    Fixes a bug where `eject` failed when a `scripts` or `config` folder already existed in the project.

* `react-dev-utils`
  * [#1035](https://github.com/facebookincubator/create-react-app/pull/1035) Fix Chrome tab reuse. ([@einarlove](https://github.com/einarlove))

    Fixes a bug with the app not opening in the existing tab in Chrome.

  * [#964](https://github.com/facebookincubator/create-react-app/pull/964) Catch and noop call to open web browser. ([@spadin](https://github.com/spadin))

    Not being able to open a browser doesn't crash the development server now.

* `eslint-config-react-app`, `react-scripts`
  * [#953](https://github.com/facebookincubator/create-react-app/pull/953) Fix `.ico` file extension being handled by test configuration. ([@vadzim](https://github.com/vadzim))

#### :nail_care: Enhancement
* `react-scripts`
  * [#1032](https://github.com/facebookincubator/create-react-app/pull/1032) Add support for non-interactive terminal. ([@sheerun](https://github.com/sheerun))
  * [#1078](https://github.com/facebookincubator/create-react-app/pull/1078) Upgrade Jest to 17.0. ([@fson](https://github.com/fson))
  * [#1059](https://github.com/facebookincubator/create-react-app/pull/1059) Use `url-loader` with limit 10k as a default loader. ([@bebbi](https://github.com/bebbi))

    `react-scripts` now treats imports with any unknown file extension as a resource. Files with a size below 10 KB are inlined using a data URI and larger files copied to the build folder. This removes the need for an internal [whitelist of supported file extensions](https://github.com/facebookincubator/create-react-app/issues/667). Any file that's not JS or CSS is now handled the same way.

  * [#924](https://github.com/facebookincubator/create-react-app/pull/924) Enable JavaScript source maps in development. ([@ekaradon](https://github.com/ekaradon))
  * [#1058](https://github.com/facebookincubator/create-react-app/pull/1058) Add missing dev argument in build script message. ([@nhajidin](https://github.com/nhajidin))
  * [#961](https://github.com/facebookincubator/create-react-app/pull/961) Add `collectCoverageFrom` option to collect coverage on files without any tests. ([@pmackcode](https://github.com/pmackcode))

    The test script now considers all files in the project when calculating test coverage.

  * [#968](https://github.com/facebookincubator/create-react-app/pull/968) Enable gzip compression in the development server (#966). ([@frontsideair](https://github.com/frontsideair))
* `react-dev-utils`, `react-scripts`
  * [#816](https://github.com/facebookincubator/create-react-app/pull/816) add logging of existing default port process on start. ([@ianmcnally](https://github.com/ianmcnally))

    `react-scripts` can guess which process is running on the port 3000 when it's not available:
    ```
    Something is already running on port 3000. Probably:
      my-app
      in /Users/ian/dev/my-app

    Would you like to run the app on another port instead?
    ```
* `react-dev-utils`
  * [#963](https://github.com/facebookincubator/create-react-app/pull/963) Allow webpack 2 as a peerDependency in react-dev-utils. ([@einarlove](https://github.com/einarlove))

#### :memo: Documentation
* `react-scripts`
  * [#1126](https://github.com/facebookincubator/create-react-app/pull/1126) Add a note about vscode-jest. ([@orta](https://github.com/orta))
  * [#1080](https://github.com/facebookincubator/create-react-app/pull/1080) Add a note for OSX users about watchman and jest. ([@dmr](https://github.com/dmr))
  * [#1071](https://github.com/facebookincubator/create-react-app/pull/1071) Adds to docs - deployment with S3/CloudFront. ([@marcgarreau](https://github.com/marcgarreau))
  * [#976](https://github.com/facebookincubator/create-react-app/pull/976) Added info on using global variables. ([@jhorneman](https://github.com/jhorneman))
  * [#996](https://github.com/facebookincubator/create-react-app/pull/996) Remove redundant `function` from export statement. ([@gnowoel](https://github.com/gnowoel))
  * [#959](https://github.com/facebookincubator/create-react-app/pull/959) Always build before deploying to gh-pages. ([@dsernst](https://github.com/dsernst))
  * [#974](https://github.com/facebookincubator/create-react-app/pull/974) Gently nudge users towards https by default. ([@Swizec](https://github.com/Swizec))
* Other
  * [#1031](https://github.com/facebookincubator/create-react-app/pull/1031) No Configuration -> Convention over Configuration. ([@sheerun](https://github.com/sheerun))
  * [#995](https://github.com/facebookincubator/create-react-app/pull/995) Add Gatsby to alternatives. ([@KyleAMathews](https://github.com/KyleAMathews))

#### :house: Internal
* `react-scripts`
  * [#1072](https://github.com/facebookincubator/create-react-app/pull/1072) Replace rimraf with fs-extra functions. ([@existentialism](https://github.com/existentialism))
  * [#1068](https://github.com/facebookincubator/create-react-app/pull/1068) Remove bundledDependencies. ([@fson](https://github.com/fson))
  * [#1057](https://github.com/facebookincubator/create-react-app/pull/1057) Update `css-loader`. ([@nhajidin](https://github.com/nhajidin))
  * [#983](https://github.com/facebookincubator/create-react-app/pull/983) Remove custom babel-loader cache dir config. ([@fson](https://github.com/fson))
* `babel-preset-react-app`
  * [#1052](https://github.com/facebookincubator/create-react-app/pull/1052) Remove unnecessary transform plugins for object spread to work. ([@valscion](https://github.com/valscion))
  * [#992](https://github.com/facebookincubator/create-react-app/pull/992) Explain the usage of react-jsx-source & react-jsx-self. ([@bboysathish](https://github.com/bboysathish))
  * [#1051](https://github.com/facebookincubator/create-react-app/pull/1051) Update babel-present-env and use node: 'current' as target. ([@valscion](https://github.com/valscion))

#### Committers: 27
- Adam Stankiewicz ([sheerun](https://github.com/sheerun))
- Alice Rose ([heldinz](https://github.com/heldinz))
- Arunoda Susiripala ([arunoda](https://github.com/arunoda))
- Brian Ng ([existentialism](https://github.com/existentialism))
- Daniel Rech ([dmr](https://github.com/dmr))
- Dave Ceddia ([dceddia](https://github.com/dceddia))
- David Ernst ([dsernst](https://github.com/dsernst))
- Dirk-Jan Rutten ([excitement-engineer](https://github.com/excitement-engineer))
- Einar Löve ([einarlove](https://github.com/einarlove))
- Fabrizio Castellarin ([EnoahNetzach](https://github.com/EnoahNetzach))
- Fatih ([frontsideair](https://github.com/frontsideair))
- Ian McNally ([ianmcnally](https://github.com/ianmcnally))
- Jurie Horneman ([jhorneman](https://github.com/jhorneman))
- Kyle Mathews ([KyleAMathews](https://github.com/KyleAMathews))
- Leo Wong ([gnowoel](https://github.com/gnowoel))
- Marc Garreau ([marcgarreau](https://github.com/marcgarreau))
- Nazim Hajidin ([nhajidin](https://github.com/nhajidin))
- Orta ([orta](https://github.com/orta))
- Patrick Mackinder ([pmackcode](https://github.com/pmackcode))
- Sandro Padin ([spadin](https://github.com/spadin))
- Sathish ([bboysathish](https://github.com/bboysathish))
- Stefan ([bebbi](https://github.com/bebbi))
- Swizec Teller ([Swizec](https://github.com/Swizec))
- Vadzim ([vadzim](https://github.com/vadzim))
- Vesa Laakso ([valscion](https://github.com/valscion))
- Ville Immonen ([fson](https://github.com/fson))
- [ekaradon](https://github.com/ekaradon)

### Migrating from 0.7.0 to 0.8.0

You may optionally update the global command (it’s not required, but it adds Yarn support for new projects):

```
npm install -g create-react-app@1.0.0
```

Inside any created project that has not been ejected, run:

```
npm install --save-dev --save-exact react-scripts@0.8.0
```

## 0.7.0 (October 22, 2016)

### Build Dependency (`react-scripts`)

* Updates Jest to [version 16.0](http://facebook.github.io/jest/blog/2016/10/03/jest-16.html), with an upgraded CLI, improved snapshot testing, new matchers and more. ([@chase](https://github.com/chase) in [#858](https://github.com/facebookincubator/create-react-app/pull/858))
* Test setup file `src/setupTests.js` is now called after test framework initialization  to support loading custom matchers. ([@just-boris](https://github.com/just-boris) in [#846](https://github.com/facebookincubator/create-react-app/pull/846))
* Build command shows better instructions for deploying the app to GitHub Pages ([@Janpot](https://github.com/Janpot) in [#841](https://github.com/facebookincubator/create-react-app/pull/841))
* Build command now generates an asset manifest with mappings from each filename to its final output filename. ([@lukyth](https://github.com/lukyth) in [#891](https://github.com/facebookincubator/create-react-app/pull/891))
* Build command exits, if there are errors from UglifyJS ([@pdillon](https://github.com/pdillon) in [#859](https://github.com/facebookincubator/create-react-app/pull/859))
* Eject output is more beautiful now. ([@azakordonets](https://github.com/azakordonets) in [#769](https://github.com/facebookincubator/create-react-app/pull/769))
* Fixes opening the app in a new tab in Chrome. ([@unixdev](https://github.com/unixdev) in [#831](https://github.com/facebookincubator/create-react-app/pull/831))
* Fixes environment variables not being defined as normal properties of the `process.env` object. ([@dvkndn](https://github.com/dvkndn) in [#807](https://github.com/facebookincubator/create-react-app/pull/807))
* Fixes PostCSS autoprefixer not processing CSS files imported with CSS `@import` statements. ([@nhunzaker](https://github.com/nhunzaker) in [#929](https://github.com/facebookincubator/create-react-app/pull/929))

### ESLint Config (`eslint-config-react-app`)

* Adds `import/no-webpack-loader-syntax` rule that forbids using custom Webpack specific syntax to specify Webpack loaders in import statements. ([@fson](https://github.com/fson) in [#803](https://github.com/facebookincubator/create-react-app/pull/803))
* `react/react-in-jsx-scope` rule ("React must be in scope") is now an error. ([@gaearon](https://github.com/gaearon) in [#822](https://github.com/facebookincubator/create-react-app/pull/822))
* `no-unused-expressions` rule now allows the use of short circuit and ternary expressions. ([@cannona](https://github.com/cannona) in [#724](https://github.com/facebookincubator/create-react-app/pull/724))

### Babel Preset (`babel-preset-react-app`)

* The preset now detects the Node.js version in test environment and disables unnecessary ES2015 transforms using using `babel-preset-env`. ([@shubheksha](https://github.com/shubheksha) in [#878](https://github.com/facebookincubator/create-react-app/pull/878), [@JeffreyATW](https://github.com/JeffreyATW) in [#927
](https://github.com/facebookincubator/create-react-app/pull/927))
* Fixes a duplicate dependency on `babel-plugin-transform-regenerator`. ([@akofman](https://github.com/akofman) in [#864](https://github.com/facebookincubator/create-react-app/pull/864))

### Utilities (`react-dev-utils`)

* The error overlay is now disposed after fixing linting errors. ([@jarlef](https://github.com/jarlef) in [#856](https://github.com/facebookincubator/create-react-app/pull/856))
* Adds support for Webpack 2 to `webpackHotDevClient`. ([@michalkvasnicak](https://github.com/michalkvasnicak) in [#840](https://github.com/facebookincubator/create-react-app/pull/840))

### Global CLI (`create-react-app`)

* Adds support for passing a scoped package name to the `--scripts-version` argument. ([@pdillon](https://github.com/pdillon) in [#826](https://github.com/facebookincubator/create-react-app/pull/826))
* Fixes installing pre-release versions using a tarball URL with the `--scripts-version` argument. ([@jihchi](https://github.com/jihchi) in [#876](https://github.com/facebookincubator/create-react-app/pull/876))

### Migrating from 0.6.1 to 0.7.0

You may optionally update the global command (it’s not required):

```
npm install -g create-react-app@0.6.0
```

Inside any created project that has not been ejected, run:

```
npm install --save-dev --save-exact react-scripts@0.7.0
```

### Breaking Change in 0.7.0

#### Updating Snapshots

Jest 16 includes [improvements to snapshot testing and changes to the snapshot format](https://facebook.github.io/jest/blog/2016/10/03/jest-16.html#snapshot-updates). If your project uses snapshot testing, you'll need to update the snapshot files. To update the snapshots, run:
```
npm test -- -u
```

## 0.6.1 (September 27, 2016)

### Build Dependency (`react-scripts`)

* Babel and ESLint configuration is now placed into `package.json` after ejecting. ([@montogeek](https://github.com/montogeek) in [#773](https://github.com/facebookincubator/create-react-app/pull/773))

### Utilities (`react-dev-utils`)

* Fixes the syntax error overlay padding. ([@fson](https://github.com/fson) in [#758](https://github.com/facebookincubator/create-react-app/pull/758))

### Migrating from 0.6.0 to 0.6.1

Inside any created project that has not been ejected, run:

```
npm install --save-dev --save-exact react-scripts@0.6.1
```

## 0.6.0 (September 25, 2016)

### Build Dependency (`react-scripts`)

* Adds an overlay for syntax errors in development. ([@gaearon](https://github.com/gaearon) in [#744](https://github.com/facebookincubator/create-react-app/pull/744))

### Utilities (`react-dev-utils`)

* Adds an alternative WebpackDevServer client that displays the error overlay. ([@gaearon](https://github.com/gaearon) in [#744](https://github.com/facebookincubator/create-react-app/pull/744))

### Migrating from 0.5.1 to 0.6.0

Inside any created project that has not been ejected, run:

```
npm install --save-dev --save-exact react-scripts@0.6.0
```

**Note: If the project fails to start, remove `node_modules`, ensure `react-scripts` is `0.6.0` in your `package.json`, and run `npm install` again. There seems to be an [npm bug](https://github.com/npm/npm/issues/14073) affecting this update.**

## 0.5.1 (September 23, 2016)

### Build Dependency (`react-scripts`)

* Updates `react-dev-utils` dependency

### Utilities (`react-dev-utils`)

* Fixes `%PUBLIC_URL%` replacement to work when specified multiple times. ([@fson](https://github.com/fson) in [#731](https://github.com/facebookincubator/create-react-app/pull/731))

### Migrating from 0.5.0 to 0.5.1

Inside any created project that has not been ejected, run:

```
npm install --save-dev --save-exact react-scripts@0.5.1
```

## 0.5.0 (September 23, 2016)

### Build Dependency (`react-scripts`)

* Adds [support for `public` folder](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md#using-the-public-folder) with arbitrary assets. ([@gaearon](https://github.com/gaearon) in [#703](https://github.com/facebookincubator/create-react-app/pull/703))
* You can now [specify defaults](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md#adding-development-environment-variables-in-env) for environment variables with `.env` file. ([@ayrton](https://github.com/ayrton) in [#695](https://github.com/facebookincubator/create-react-app/pull/695))  
* Ejecting now generates proper `.babelrc` and `.eslintrc`. ([@fson](https://github.com/fson) in [#689](https://github.com/facebookincubator/create-react-app/pull/689), [@gaearon](https://github.com/gaearon) in [#705](https://github.com/facebookincubator/create-react-app/pull/705))
* Some React warnings now [include the component stacktrace](https://twitter.com/dan_abramov/status/779308833399332864). ([@gaearon](https://github.com/gaearon) in [#716](https://github.com/facebookincubator/create-react-app/pull/716))
* `npm start` doesn’t fail in a composed Docker container. ([@arekkas](https://github.com/arekkas) in [#711](https://github.com/facebookincubator/create-react-app/issues/711))
* The projects generated with `eject` are now cleaner. ([@gaearon](https://github.com/gaearon) in [#723](https://github.com/facebookincubator/create-react-app/pull/723))
* The project is now managed as a monorepo. ([@ryanyogan](https://github.com/ryanyogan) in [#419](https://github.com/facebookincubator/create-react-app/pull/419), [@fson](https://github.com/fson) in [#678](https://github.com/facebookincubator/create-react-app/pull/678))

### ESLint Config (`eslint-config-react-app`)

* Published for the first time! ([@fson](https://github.com/fson) in [#689](https://github.com/facebookincubator/create-react-app/pull/689))
* Added [`react/no-danger-with-children`](https://github.com/yannickcr/eslint-plugin-react/blob/v6.3.0/docs/rules/no-danger-with-children.md) and [`react/style-prop-object`](https://github.com/yannickcr/eslint-plugin-react/blob/v6.3.0/docs/rules/style-prop-object.md) rules. ([@fson](https://github.com/fson) in [#696](https://github.com/facebookincubator/create-react-app/pull/696))

### Babel Preset (`babel-preset-react-app`)

* Published for the first time! ([@fson](https://github.com/fson) in [#701](https://github.com/facebookincubator/create-react-app/pull/701))

### Utilities (`react-dev-utils`)

* Published for the first time! ([@gaearon](https://github.com/gaearon) in [#723](https://github.com/facebookincubator/create-react-app/pull/723))

### Global CLI (`create-react-app`)

* Added `README` to npm. There were no other changes.

### Migrating from 0.4.3 to 0.5.0

Inside any created project that has not been ejected, run:

```
npm install --save-dev --save-exact react-scripts@0.5.0
```

### Breaking Changes in 0.5.0

#### Global ESLint Plugin Versions

If you used a global ESLint installation for the editor integration, you’ll need to install [these versions of global ESLint packages](https://github.com/facebookincubator/create-react-app/blob/c092086b1b256fd081f10744f90d216dd5217e29/packages/eslint-config-react-app/package.json#L14-L19).

#### Moving `index.html` into `public` Folder

You’ll also need to create a new folder called `public` in the root of your project. Then, move `index.html` and files it references (such as a favicon) into that folder.

You can no longer reference any files from `./src` in `index.html`. Instead, `public/index.html` can now only reference files other inside of the `public` folder using a special variable called `%PUBLIC_URL%`.

For example, instead of:

```js
<link rel="shortcut icon" href="./src/favicon.ico">
```

You would need to move both `index.html` and `src/favicon.ico` into the `public` folder, and change `<link>` to look like this:

```html
<link rel="shortcut icon" href="%PUBLIC_URL%/favicon.ico">
```

This ensures it become a part of the build output, and resolves correctly both with client-side routing and non-root `homepage` in `package.json`. Read more about [using the `public` folder](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md#using-the-public-folder) and [why these changes were made](https://github.com/facebookincubator/create-react-app/pull/703).

## 0.4.3 (September 18, 2016)

This is a hotfix release for a broken package.  
It contained no changes to the code.

### Build Dependency (`react-scripts`)

* Fixes a packaging issue that affected npm 2. ([#676](https://github.com/facebookincubator/create-react-app/issues/676))

### Migrating from 0.4.2 to 0.4.3

Inside any created project that has not been ejected, run:

```
npm install --save-dev --save-exact react-scripts@0.4.3
```

## 0.4.2 (September 18, 2016)

### Build Dependency (`react-scripts`)

* Lint output in editor is now opt-in because, due to [this ESLint issue](https://github.com/eslint/eslint/issues/3458), it is broken by default in Atom. ([@fson](https://github.com/fson) in [#649](https://github.com/facebookincubator/create-react-app/pull/649))
* Fixes an issue causing compile errors when project folder is inside a symlink. ([@motiz88](https://github.com/motiz88) in [#648](https://github.com/facebookincubator/create-react-app/pull/648))
* You can now import `jpeg`, `wav`, `mp3`, `m4a`, `aac`, and `oga`. ([@mareksuscak](https://github.com/mareksuscak) in [#624](https://github.com/facebookincubator/create-react-app/pull/624), [@danharper](https://github.com/danharper) in [#665](https://github.com/facebookincubator/create-react-app/pull/665))
* Fixes false positives caused by the case sensitive import warning on Windows. ([@Urthen](https://github.com/Urthen) in [#593](https://github.com/facebookincubator/create-react-app/pull/593))
* With Docker, `*.json.gzip` files are no longer created in the project folder. ([@thangngoc89](https://github.com/thangngoc89) in [#620](https://github.com/facebookincubator/create-react-app/pull/620))
* Proxy network errors now abort requests instead of hanging. ([@cloudmu](https://github.com/cloudmu) in [#588](https://github.com/facebookincubator/create-react-app/pull/588))
* Connection to the development server does not get interrupted in HTTPS mode. ([@dceddia](https://github.com/dceddia) in [#652](https://github.com/facebookincubator/create-react-app/pull/652))
* Unsupported Node versions now print a warning. ([@fson](https://github.com/fson) in [#575](https://github.com/facebookincubator/create-react-app/pull/575))
* Importing assets with special characters like `@` now works with tests. ([@fson](https://github.com/fson) in [#584](https://github.com/facebookincubator/create-react-app/pull/584))
* Undefined variable lint rule is promoted from a warning to an error. ([@gaearon](https://github.com/gaearon) in [#669](https://github.com/facebookincubator/create-react-app/pull/669))
* Variables starting with underscore no longer trigger the “unused variable” rule. ([@valscion](https://github.com/valscion) in [#640](https://github.com/facebookincubator/create-react-app/pull/640))
* We now print a friendly error when required files are missing. ([@vnctaing](https://github.com/vnctaing) in [#653](https://github.com/facebookincubator/create-react-app/pull/653))
* The output after creating a project is better formatted. ([@btnwtn](https://github.com/btnwtn) in [#629](https://github.com/facebookincubator/create-react-app/pull/629))
* Development server logs are less noisy. ([@gaearon](https://github.com/gaearon) in [122068](https://github.com/facebookincubator/create-react-app/commit/1220683276dd9eb2f2719aece7f40bf2ffb397b4))

### Global CLI (`create-react-app`)

* It now runs on early Node versions to print a friendly warning instead of crashing. ([@sotojuan](https://github.com/sotojuan) in [fc3ab4](https://github.com/facebookincubator/create-react-app/commit/fc3ab46d2a54f142f9287ce7de9ab2fc2514487d))
* We now print a friendly message when you create a project with invalid name. ([@mareksuscak](https://github.com/mareksuscak) in [#628](https://github.com/facebookincubator/create-react-app/pull/628))
* Passing a custom fork of `react-scripts` to `create-react-app` with `--scripts-version` works again. ([@yesmeck](https://github.com/yesmeck) in [#632](https://github.com/facebookincubator/create-react-app/pull/632))

### Migrating from 0.4.1 to 0.4.2

You may optionally update the global command (it’s not required):

```
npm install -g create-react-app@0.4.2
```

Inside any created project that has not been ejected, run:

```
npm install --save-dev --save-exact react-scripts@0.4.2
```

## 0.4.1 (September 3, 2016)

### Build Dependency (`react-scripts`)

* We now support (but [don’t recommend](https://github.com/facebookincubator/create-react-app/issues/87#issuecomment-234627904)) `.jsx` file extension. ([@tizmagik](https://github.com/tizmagik) in [#563](https://github.com/facebookincubator/create-react-app/pull/563))
* Proxy request errors are now printed to the console. ([@cloudmu](https://github.com/cloudmu) in [#502](https://github.com/facebookincubator/create-react-app/pull/502))

### Migrating from 0.4.0 to 0.4.1

Inside any created project that has not been ejected, run:

```
npm install --save-dev --save-exact react-scripts@0.4.1
```

## 0.4.0 (September 2, 2016)

### Build Dependency (`react-scripts`)

* **Breaking Change:** Disabled implicit serving of source files in development. ([@gaearon](https://github.com/gaearon) in [#551](https://github.com/facebookincubator/create-react-app/pull/551))
* You can use `NODE_PATH` environment variable for absolute `import` paths. ([@jimmyhmiller](https://github.com/jimmyhmiller) in [#476](https://github.com/facebookincubator/create-react-app/pull/476))
* If `src/setupTests.js` exists, it will be used to setup the test environment. ([@gaelduplessix](https://github.com/gaelduplessix) in [#548](https://github.com/facebookincubator/create-react-app/pull/548))
* If `HTTPS` environment variable is set to `true`, development server will run in HTTPS mode. ([@dceddia](https://github.com/dceddia) in [#552](https://github.com/facebookincubator/create-react-app/pull/552))

### Migrating from 0.3.1 to 0.4.0

Inside any created project that has not been ejected, run:

```
npm install --save-dev --save-exact react-scripts@0.4.0
```

### Breaking Change in 0.4.0

Paths like `/src/somefile.png` used to be served in development, but only by accident. They never worked in production builds. Since 0.4.0, we [don’t serve static files by default in development anymore either](https://github.com/facebookincubator/create-react-app/pull/551). This removes a dangerous inconsistency that we never intentionally supported.

If you need a static file to be part for the build, [import it from JavaScript and you will get its filename](https://github.com/facebookincubator/create-react-app/blob/master/template/README.md#adding-images-and-fonts). This ensures it gets included into the production build as well, and its filename contains the content hash.

If you used static files with `<link href>`, [read this new guide](https://github.com/facebookincubator/create-react-app/blob/master/template/README.md#referring-to-static-assets-from-link-href) on how to make sure these files get included into the builds. For example, you can replace `<link href="/src/favicons/favicon-32.png">` with `<link href="./src/favicons/favicon-32.png">`, and then Webpack will recognize it and include it into the build.

If you referenced some other files from `index.html`, please file an issue to discuss your use case. In the meantime, you can serve them from a separate static server until your use case is supported.

## 0.3.1 (September 2, 2016)

### Build Dependency (`react-scripts`)

* Bumps Jest dependency to fix a few issues discovered yesterday. ([@cpojer](https://github.com/cpojer) in [facebook/jest#1580](https://github.com/facebook/jest/pull/1580), [@insin](https://github.com/insin) in [facebook/jest#1574](https://github.com/facebook/jest/pull/1574))

### Migrating from 0.3.0 to 0.3.1

Inside any created project that has not been ejected, run:

```
npm install --save-dev --save-exact react-scripts@0.3.1
```

## 0.3.0 (September 1, 2016)

### Build Dependency (`react-scripts`)

* Testing is [now supported](https://github.com/facebookincubator/create-react-app/blob/master/template/README.md#running-tests)! ([Jest project contributors](https://github.com/facebook/jest/pulls?q=is%3Apr+is%3Aclosed), [@cpojer](https://github.com/cpojer) in [#250](https://github.com/facebookincubator/create-react-app/pull/250), [@gaearon](https://github.com/gaearon) in [#378](https://github.com/facebookincubator/create-react-app/pull/378), [#530](https://github.com/facebookincubator/create-react-app/pull/530), [#533](https://github.com/facebookincubator/create-react-app/pull/533))
* Static files such as CSS, images, and fonts, can now exist outside `src` directory. ([@fson](https://github.com/fson) in [#504](https://github.com/facebookincubator/create-react-app/pull/504))
* **Breaking Change:** Local paths in `<link href>` in `index.html` will now be correctly resolved, so deleting `favicon.ico` is not an error anymore. ([@andreypopp](https://github.com/andreypopp) in [#428](https://github.com/facebookincubator/create-react-app/pull/428))
* Removed an annoying lint rule that warned for `<div ref={node => this.node = node}>`. ([@mrscobbler](https://github.com/mrscobbler) in [#529](https://github.com/facebookincubator/create-react-app/pull/529))
* Temporarily disabled `react-constant-elements` Babel transform because of its bugs. ([@gaearon](https://github.com/gaearon) in [#534](https://github.com/facebookincubator/create-react-app/pull/534))
* Fixed a permission issue with Docker. ([@gaearon](https://github.com/gaearon) in [73c940](https://github.com/facebookincubator/create-react-app/commit/73c940a73205d761230f8d6bf81ecfd460ba28a9))
* Fixed an issue with generator syntax in Jest that occurred in an alpha release. ([@gaearon](https://github.com/gaearon) in [#535](https://github.com/facebookincubator/create-react-app/pull/535))

### Global CLI (`create-react-app`)

* You can now create a project in a folder that already contains an `.idea` folder, which is necessary for future WebStorm integration. ([@denofevil](https://github.com/denofevil) in [#522](https://github.com/facebookincubator/create-react-app/pull/522))

### Migrating from 0.2.3 to 0.3.0

You may optionally update the global command (it’s not required):

```
npm install -g create-react-app@0.3.0
```

Inside any created project that has not been ejected, run:

```
npm install --save-dev --save-exact react-scripts@0.3.0
```

#### Breaking Change

Now `favicon.ico` is not treated specially anymore.  
If you use it, move it to `src` and add the following line to `<head>` in your HTML:

```html
<link rel="shortcut icon" href="./src/favicon.ico">
```

#### New Feature

Since 0.3.0 added a test runner, we recommend that you add it to the `scripts` section of your `package.json` like this:

```js
  // ...
  "scripts": {
    // ...
    "test": "react-scripts test --env=jsdom"
  }
```

[Then read the testing guide to learn more about using it!](https://github.com/facebookincubator/create-react-app/blob/master/template/README.md#running-tests)

## 0.2.3 (August 25, 2016)

### Build Dependency (`react-scripts`)

* You can now [proxy requests to an API server](https://github.com/facebookincubator/create-react-app/blob/ef94b0561d5afb9b50b905fa5cd3f94e965c69c0/template/README.md#proxying-api-requests-in-development) without worrying about CORS. ([@gaearon](https://github.com/gaearon) in [#282](https://github.com/facebookincubator/create-react-app/pull/282))
* You can now [pass custom environment variables](https://github.com/facebookincubator/create-react-app/blob/ef94b0561d5afb9b50b905fa5cd3f94e965c69c0/template/README.md#adding-custom-environment-variables) to your application. ([@eliperelman](https://github.com/eliperelman) in [#342](https://github.com/facebookincubator/create-react-app/pull/342))
* You can now [use `async` and `await`](https://ponyfoo.com/articles/understanding-javascript-async-await) syntax. ([@gaearon](https://github.com/gaearon) in [#327](https://github.com/facebookincubator/create-react-app/pull/327), [@fson](https://github.com/fson) in [#332](https://github.com/facebookincubator/create-react-app/pull/332))
* Paths with period in them now load successfully on the development server. ([@mxstbr](https://github.com/mxstbr) in [#422](https://github.com/facebookincubator/create-react-app/pull/422))
* Images with `.webp` extension are now supported. ([@gafemoyano](https://github.com/gafemoyano) in [#458](https://github.com/facebookincubator/create-react-app/pull/458))
* The most recent version of React is now added to `package.json`. ([@wdhorton](https://github.com/wdhorton) in [#477](https://github.com/facebookincubator/create-react-app/pull/477))
* Babel configuration is simplified. ([@kripod](https://github.com/kripod) in [#490](https://github.com/facebookincubator/create-react-app/pull/490))

### Migrating from 0.2.2 to 0.2.3

Update `react-scripts` to point to `0.2.3` in your `package.json` and run `npm install`. You shouldn’t need to do anything else.

Newly created projects will use `0.2.3` automatically. You **don’t** need to update the global `create-react-app` CLI itself. It stays at `0.2.0` for now because it doesn’t have any changes.

## 0.2.2 (August 22, 2016)

### Build Dependency (`react-scripts`)

* When the bundle size changes, we now display the difference after build. ([@elijahmanor](https://github.com/elijahmanor) in [#340](https://github.com/facebookincubator/create-react-app/pull/340))
* `npm install`ing a missing dependency now forces a rebuild. ([@gaearon](https://github.com/gaearon) in [#349](https://github.com/facebookincubator/create-react-app/pull/349))
* Autoprefixer config now includes more commonly supported browsers. ([@kripod](https://github.com/kripod) in [#345](https://github.com/facebookincubator/create-react-app/pull/345))
* All the configuration is now documented inline so ejecting doesn’t leave you in the dark. ([@gaearon](https://github.com/gaearon) in [#362](https://github.com/facebookincubator/create-react-app/pull/362))
* `Object.assign()` polyfill is now bundled by default. ([@gaearon](https://github.com/gaearon) in [#399](https://github.com/facebookincubator/create-react-app/pull/399))
* [React Native Web](https://www.smashingmagazine.com/2016/08/a-glimpse-into-the-future-with-react-native-for-web/) now works out of the box. ([@grigio](https://github.com/grigio) in [#407](https://github.com/facebookincubator/create-react-app/pull/407))
* Same asset filenames in different folders don’t confuse the server now. ([@arunoda](https://github.com/arunoda) in [#446](https://github.com/facebookincubator/create-react-app/pull/446))
* The `otf` font format is now supported. ([@A-gambit](https://github.com/A-gambit) in [#434](https://github.com/facebookincubator/create-react-app/pull/434))
* The `new-cap` linting rule has been disabled thanks to feedback from Immutable.js users. ([@rricard](https://github.com/rricard) in [#470](https://github.com/facebookincubator/create-react-app/pull/470))

### Migrating from 0.2.1 to 0.2.2

Update `react-scripts` to point to `0.2.2` in your `package.json` and run `npm install`. You shouldn’t need to do anything else.

Newly created projects will use `0.2.2` automatically. You **don’t** need to update the global `create-react-app` CLI itself. It stays at `0.2.0` for now because it doesn’t have any changes.

## 0.2.1 (August 1, 2016)

### Build Dependency (`react-scripts`)

* Fixes an issue with `npm start` taking a very long time on OS X with Firewall enabled ([@gaearon](https://github.com/gaearon) in [#319](https://github.com/facebookincubator/create-react-app/pull/319))
* Fixes an issue with Webpack eating a lot of CPU in some cases ([@dceddia](https://github.com/dceddia) in [#294](https://github.com/facebookincubator/create-react-app/pull/294))
* We now warn if you import a file with mismatched casing because this breaks the watcher ([@alexzherdev](https://github.com/alexzherdev) in [#266](https://github.com/facebookincubator/create-react-app/pull/266))
* CSS files specifying `?v=` after asset filenames, such as Font Awesome, now works correctly ([@alexzherdev](https://github.com/alexzherdev) in [#298](https://github.com/facebookincubator/create-react-app/pull/298))
* Issues with `npm link`ing `react-scripts` have been fixed ([@dallonf](https://github.com/dallonf) in [#277](https://github.com/facebookincubator/create-react-app/pull/277))
* We now use `/static` prefix for assets both in development and production ([@gaearon](https://github.com/gaearon) in [#278](https://github.com/facebookincubator/create-react-app/pull/278))

### Migrating from 0.2.0 to 0.2.1

Update `react-scripts` to point to `0.2.1` in your `package.json` and run `npm install`. You shouldn’t need to do anything else. If you see a warning about wrong file casing next time you `npm start`, fix your imports to use the correct filename casing.

Newly created projects will use `0.2.1` automatically. You **don’t** need to update the global `create-react-app` CLI itself. It stays at `0.2.0` for now because it doesn’t have any changes.

## 0.2.0 (July 28, 2016)

### Build Dependency (`react-scripts`)

* You can now enable deployment to GitHub Pages by adding `homepage` field to `package.json` ([@dhruska](https://github.com/dhruska) in [#94](https://github.com/facebookincubator/create-react-app/pull/94))
* Development server now runs on `0.0.0.0` and works with VirtualBox ([@JWo1F](https://github.com/JWo1F) in [#128](https://github.com/facebookincubator/create-react-app/pull/128))
* Cloud9 and Nitrous online IDEs are now supported ([@gaearon](http://github.com/gaearon) in [2fe84e](https://github.com/facebookincubator/create-react-app/commit/2fe84ecded55f1d5258d91f9c2c07698ae0d2fb4))
* When `3000` port is taken, we offer to use another port ([@chocnut](https://github.com/chocnut) in [#101](https://github.com/facebookincubator/create-react-app/pull/101), [2edf21](https://github.com/facebookincubator/create-react-app/commit/2edf2180f2aa6bf647807d0b1fcd95f4cfe4a558))
* You can now `import` CSS files from npm modules ([@glennreyes](https://github.com/glennreyes) in [#105](https://github.com/facebookincubator/create-react-app/pull/105), [@breaddevil](https://github.com/breaddevil) in [#178](https://github.com/facebookincubator/create-react-app/pull/178))
* `fetch` and `Promise` polyfills are now always included ([@gaearon](https://github.com/gaearon) in [#235](https://github.com/facebookincubator/create-react-app/pull/235))
* Regenerator runtime is now included if you use ES6 generators ([@gaearon](https://github.com/gaearon) in [#238](https://github.com/facebookincubator/create-react-app/pull/238))
* Generated project now contains `.gitignore` ([@npverni](https://github.com/npverni) in [#79](https://github.com/facebookincubator/create-react-app/pull/79), [@chibicode](https://github.com/chibicode) in [#112](https://github.com/facebookincubator/create-react-app/pull/112))
* ESLint config is now more compatible with Flow ([@gaearon](https://github.com/gaearon) in [#261](https://github.com/facebookincubator/create-react-app/pull/261))
* A stylistic lint rule about method naming has been removed ([@mxstbr](https://github.com/mxstbr) in [#152](https://github.com/facebookincubator/create-react-app/pull/157))
* A few unobtrusive accessibility lint rules have been added ([@evcohen](https://github.com/evcohen) in [#175](https://github.com/facebookincubator/create-react-app/pull/175))
* A `.babelrc` in parent directory no longer causes an error ([@alexzherdev](https://github.com/alexzherdev) in [#236](https://github.com/facebookincubator/create-react-app/pull/236))
* Files with `.json` extension are now discovered ([@gaearon](https://github.com/gaearon) in [a11d6a](https://github.com/facebookincubator/create-react-app/commit/a11d6a398f487f9163880dd34667b1d3e14b147a))
* Bug fixes from transitive dependencies are included ([#126](https://github.com/facebookincubator/create-react-app/issues/126))
* Linting now works with IDEs if you follow [these](https://github.com/facebookincubator/create-react-app/blob/master/template/README.md#display-lint-output-in-the-editor) instructions ([@keyanzhang](https://github.com/keyanzhang) in [#149](https://github.com/facebookincubator/create-react-app/pull/149))
* After building, we now print gzipped bundle size ([@lvwrence](https://github.com/lvwrence) in [#229](https://github.com/facebookincubator/create-react-app/pull/229))

### Global CLI (`create-react-app`)

* It enforces that you have Node >= 4 ([@conorhastings](https://github.com/conorhastings) in [#88](https://github.com/facebookincubator/create-react-app/pull/88))
* It handles `--version` flag correctly ([@mxstbr](https://github.com/mxstbr) in [#152](https://github.com/facebookincubator/create-react-app/pull/152))

### Migrating from 0.1.0 to 0.2.0

You may optionally update the global command (it’s not required):

```
npm install -g create-react-app@0.2.0
```

Inside any created project that has not been ejected, run:

```
npm install --save-dev --save-exact react-scripts@0.2.0
```

You may need to fix a few lint warnings about missing `<img alt>` tag, but everything else should work out of the box. If you intend to deploy your site to GitHub Pages, you may now [add `homepage` field to `package.json`](https://github.com/facebookincubator/create-react-app/blob/master/template/README.md#deploy-to-github-pages). If you had [issues with integrating editor linter plugins](https://github.com/facebookincubator/create-react-app/issues/124), follow [these new instructions](https://github.com/facebookincubator/create-react-app/blob/master/template/README.md#display-lint-output-in-the-editor).

## 0.1.0 (July 22, 2016)

* Initial public release
