# babel-preset-inferno-app

This package includes the Babel preset used by [Create Inferno App](https://github.com/infernojs/create-inferno-app).  
Please refer to its documentation:

* [Getting Started](https://github.com/infernojs/create-inferno-app/blob/master/README.md#getting-started) – How to create a new app.
* [User Guide](https://github.com/infernojs/create-inferno-app/blob/master/packages/inferno-scripts/template/README.md) – How to develop apps bootstrapped with Create Inferno App.

## Usage in Create Inferno App Projects

The easiest way to use this configuration is with [Create Inferno App](https://github.com/infernojs/create-inferno-app), which includes it by default. **You don’t need to install it separately in Create Inferno App projects.**

## Usage Outside of Create Inferno App

If you want to use this Babel preset in a project not built with Create Inferno App, you can install it with following steps.

First, [install Babel](https://babeljs.io/docs/setup/).

Then create a file named `.babelrc` with following contents in the root folder of your project:

  ```js
  {
    "presets": ["inferno-app"]
  }
  ```
