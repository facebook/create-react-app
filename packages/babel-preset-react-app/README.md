# babel-preset-react-app

This package includes the Babel preset used by [Create React App](https://github.com/facebookincubator/create-react-app).

## Usage in Create React App Projects

The easiest way to use this configuration is with [Create React App](https://github.com/facebookincubator/create-react-app), which includes it by default. **You don’t need to install it separately in Create React App projects.**

## Usage Outside of Create React App

If you want to use this ESLint configuration in a project not built with Create React App, you can install it with following steps.

First, [install Babel](https://babeljs.io/docs/setup/).

Then create a file named `.babelrc` with following contents in the root folder of your project:

  ```js
  {
    "presets": ["react-app"]
  }
  ```
