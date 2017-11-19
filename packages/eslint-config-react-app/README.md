# @stinkstudios/eslint-config-react-app

This package includes the shareable ESLint configuration used by [@stinkstudios/create-react-app](https://github.com/stinkstudios/create-react-app).<br>
Please refer to its documentation:

* [Getting Started](https://github.com/stinkstudios/create-react-app/blob/master/README.md#getting-started) – How to create a new app.
* [User Guide](https://github.com/stinkstudios/create-react-app/blob/master/packages/react-scripts/template/README.md) – How to develop apps bootstrapped with Create React App.

## Usage in Create React App Projects

The easiest way to use this configuration is with [@stinkstudios/create-react-app](https://github.com/stinkstudios/create-react-app), which includes it by default.

**You don’t need to install it separately in @stinkstudios Create React App projects.**

## Usage Outside of @stinkstudios Create React App

If you want to use this ESLint configuration in a project not built with @stinkstudios Create React App, you can install it with following steps.

First, install this package, ESLint and the necessary plugins.

  ```sh
  npm install --save-dev @stinkstudios/eslint-config-react-app babel-eslint@^8.0.2 eslint@^4.11.0 eslint-plugin-flowtype@^2.39.1 eslint-plugin-import@^2.8.0 eslint-plugin-jsx-a11y@^6.0.2 eslint-plugin-react@^7.5.0
  ```

Then create a file named `.eslintrc` with following contents in the root folder of your project:

  ```js
  {
    "extends": "@stinkstudios/eslint-config-react-app"
  }
  ```

  That's it! You can override the settings from `@stinkstudios/eslint-config-react-app` by editing the `.eslintrc` file. Learn more about [configuring ESLint](http://eslint.org/docs/user-guide/configuring) on the ESLint website.

[IDE integrations](https://github.com/stinkstudios/create-react-app/blob/master/packages/react-scripts/template/README.md#displaying-lint-output-in-the-editor), but not in the browser or the terminal.
