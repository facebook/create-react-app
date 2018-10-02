# babel-preset-react-app

This package includes the Babel preset used by [Create React App](https://github.com/facebook/create-react-app).<br>
Please refer to its documentation:

- [Getting Started](https://facebook.github.io/create-react-app/docs/getting-started) – How to create a new app.
- [User Guide](https://facebook.github.io/create-react-app/) – How to develop apps bootstrapped with Create React App.

## Usage in Create React App Projects

The easiest way to use this configuration is with [Create React App](https://github.com/facebook/create-react-app), which includes it by default. **You don’t need to install it separately in Create React App projects.**

## Usage Outside of Create React App

If you want to use this Babel preset in a project not built with Create React App, you can install it with the following steps.

First, [install Babel](https://babeljs.io/docs/setup/).

Then install babel-preset-react-app.

```sh
npm install babel-preset-react-app --save-dev
```

Then create a file named `.babelrc` with following contents in the root folder of your project:

```json
{
  "presets": ["react-app"]
}
```

This preset uses the `useBuiltIns` option with [transform-object-rest-spread](http://babeljs.io/docs/plugins/transform-object-rest-spread/) and [transform-react-jsx](http://babeljs.io/docs/plugins/transform-react-jsx/), which assumes that `Object.assign` is available or polyfilled.

## Usage with Flow

Make sure you have a `.flowconfig` file at the root directory. You can also use the `flow` option on `.babelrc`:

```json
{
  "presets": [["react-app", { "flow": true, "typescript": false }]]
}
```

## Usage with TypeScript

Make sure you have a `tsconfig.json` file at the root directory. You can also use the `typescript` option on `.babelrc`:

```json
{
  "presets": [["react-app", { "flow": false, "typescript": true }]]
}
```

## Usage within NPM packages

If you are creating an NPM package that contains a React component you can use the options for `commonjs` and `esmodules` to create proper builds for `lib`, `es` and `dist` folders. The configuration example below will work for most common cases but will not be suitable to all projects. Similar setups are used by popular NPM packages such as [react-redux](https://github.com/reduxjs/react-redux) and [react-router](https://github.com/ReactTraining/react-router/tree/master/packages/react-router).

### `babel.config.js`

When building for `lib`, `es` folders you want to set the `absoluteRuntime` to false. When building for the `dist` folder, you also want to disable helpers (because Rollup manages helpers automatically).

Note that it is recommended to set `NODE_ENV` environment variable to "production" when building an NPM package. Setting `NODE_ENV` to "development" will put the `@babel/preset-react` plugin into development mode, which is undesirable for a published NPM package.

```js
const { NODE_ENV, MODULES_ENV } = process.env;

const isEnvTest = NODE_ENV === 'test';
if (!isEnvTest) {
  // force production mode for package builds
  process.env.NODE_ENV = 'production';
}

const useCommonJS = isEnvTest || MODULES_ENV === 'commonjs';
const useESModules = MODULES_ENV === 'esmodules';

module.exports = {
  presets: [
    // for testing with jest/jsdom
    useCommonJS && isEnvTest && 'babel-preset-react-app/test',
    // building for lib folder
    useCommonJS &&
      !isEnvTest && [
        'babel-preset-react-app/commonjs',
        { absoluteRuntime: false },
      ],
    // building for es folder
    useESModules && [
      'babel-preset-react-app/esmodules',
      { absoluteRuntime: false },
    ],
    // building for dist folder
    !useCommonJS &&
      !useESModules && ['babel-preset-react-app', { helpers: false }],
  ].filter(Boolean),
};
```
